import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import fetch from 'node-fetch';
import pino from 'pino';
import { z } from 'zod';
import { AdminApi } from '@airport/sdk';
import * as dns from 'dns/promises';
import * as ipAddr from 'ipaddr.js';
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';
const serviceToken = process.env.SERVICE_TOKEN ?? '';
const adminApi = new AdminApi({
    baseUrl: apiBaseUrl,
    tokenProvider: async () => serviceToken,
});
const defaultJobOptions = {
    removeOnComplete: true,
    removeOnFail: 50,
};
const telemetryQueue = new Queue('telemetry', { connection, defaultJobOptions });
const syncQueue = new Queue('provider-sync', { connection, defaultJobOptions });
const alertQueue = new Queue('alert', { connection, defaultJobOptions });
// ─────────────────────────────────────────────────────────────────────────────
// Probe schema
// ─────────────────────────────────────────────────────────────────────────────
const probeSchema = z.object({
    id: z.string(),
    hostname: z.string(),
    port: z.number(),
    protocol: z.enum(['vmess', 'vless', 'trojan', 'ss', 'socks', 'http']),
});
// ─────────────────────────────────────────────────────────────────────────────
// TCP-level latency probe via HTTP HEAD with Second-Order SSRF check
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Checks if the given IP address is in a forbidden range (e.g. private networks, IMDS)
 */
function isForbiddenIP(ip) {
    try {
        const parsed = ipAddr.parse(ip);
        const range = parsed.range();
        switch (range) {
            case 'loopback':
            case 'private':
            case 'linkLocal':
            case 'unspecified':
            case 'broadcast':
                return true;
            default:
                return false;
        }
    }
    catch (e) {
        return false;
    }
}
const performTcpPing = async (host, port) => {
    // SSRF Mitigation: Block probes to internal network and IMDS (169.254.169.254)
    if (process.env.DISABLE_SSRF_PROTECTION !== 'true') {
        try {
            const lookupResult = await dns.lookup(host, { all: true });
            for (const res of lookupResult) {
                if (isForbiddenIP(res.address)) {
                    logger.warn({ host, ip: res.address }, 'ssrf_probe_blocked');
                    return undefined; // Pretend it failed/timed out
                }
            }
        }
        catch (err) {
            logger.warn({ host, error: err }, 'ssrf_dns_lookup_failed');
            return undefined;
        }
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    const start = Date.now();
    try {
        // Note: Node-fetch doesn't strictly prevent DNS rebinding here, but for TCP ping
        // this pre-flight check blocks the vast majority of practical automated SSRF scanning.
        await fetch(`http://${host}:${port}`, { method: 'HEAD', signal: controller.signal });
        return Date.now() - start;
    }
    catch (error) {
        logger.warn({ host, port, error }, 'probe_failed');
        return undefined;
    }
    finally {
        clearTimeout(timeout);
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// Scheduler: enqueue telemetry probe jobs for every active node
// ─────────────────────────────────────────────────────────────────────────────
/** How often (ms) to probe all nodes */
const NODE_PROBE_INTERVAL_MS = Number(process.env.NODE_PROBE_INTERVAL_MS ?? 60_000); // 1 min default
/** How often (ms) to sync all providers */
const PROVIDER_SYNC_INTERVAL_MS = Number(process.env.PROVIDER_SYNC_INTERVAL_MS ?? 15 * 60_000); // 15 min default
async function scheduleNodeProbes() {
    try {
        const result = await adminApi.listNodes({ pageSize: 500 });
        const nodes = result.data;
        if (!nodes.length) {
            logger.info('scheduler: no active nodes to probe');
            return;
        }
        // Spread probes evenly over the interval to avoid thundering herd
        const delayStep = Math.floor(NODE_PROBE_INTERVAL_MS / nodes.length);
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            await telemetryQueue.add('probe', { id: node.id, hostname: node.hostname, port: node.port, protocol: node.protocol }, { delay: i * delayStep });
        }
        logger.info({ count: nodes.length }, 'scheduler: enqueued telemetry probes');
    }
    catch (error) {
        logger.error({ error }, 'scheduler: failed to enqueue node probes');
    }
}
async function scheduleProviderSyncs() {
    try {
        const providers = await adminApi.listProviders();
        for (const provider of providers) {
            await syncQueue.add('sync', { providerId: provider.id });
        }
        logger.info({ count: providers.length }, 'scheduler: enqueued provider syncs');
    }
    catch (error) {
        logger.error({ error }, 'scheduler: failed to enqueue provider syncs');
    }
}
// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────
async function bootstrap() {
    await connection.connect();
    // ── Workers ────────────────────────────────────────────────────────────────
    const telemetryWorker = new Worker('telemetry', async (job) => {
        const node = probeSchema.parse(job.data);
        const latencyMs = await performTcpPing(node.hostname, node.port);
        const timestamp = new Date().toISOString();
        const result = {
            nodeId: node.id,
            latencyMs: latencyMs ?? null,
            // TODO: replace random mock with real ICMP/TCP packet loss measurement
            packetLoss: latencyMs !== undefined ? Math.random() * 0.02 : 1,
            timestamp,
        };
        return result;
    }, { connection });
    telemetryWorker.on('completed', async (_job, result) => {
        if (!result)
            return;
        try {
            const res = await fetch(`${apiBaseUrl}/ingest/telemetry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${serviceToken}` },
                body: JSON.stringify(result),
            });
            if (!res.ok) {
                logger.warn({ status: res.status }, 'ingest_telemetry_non_ok');
            }
        }
        catch (error) {
            logger.error({ error }, 'send_telemetry_failed');
        }
    });
    const syncWorker = new Worker('provider-sync', async (job) => {
        const providerId = z.string().parse(job.data.providerId);
        await adminApi.syncProvider(providerId);
        logger.info({ providerId }, 'provider_synced');
    }, { connection });
    // Alert worker — actual dispatch handled by API's telemetry.service.
    // This queue is reserved for future multi-point or external dispatcher use.
    const alertWorker = new Worker('alert', async (job) => {
        const payload = z
            .object({
            severity: z.enum(['warning', 'critical']),
            message: z.string(),
            channel: z.enum(['telegram', 'email']),
            metadata: z.record(z.any()).optional(),
        })
            .parse(job.data);
        logger.info(payload, 'dispatch_alert_placeholder');
    }, { connection });
    // ── Schedulers ─────────────────────────────────────────────────────────────
    logger.info({ nodeProbeIntervalMs: NODE_PROBE_INTERVAL_MS, providerSyncIntervalMs: PROVIDER_SYNC_INTERVAL_MS }, 'worker bootstrapped — starting schedulers');
    // Run immediately on startup, then repeat on interval
    await scheduleNodeProbes();
    await scheduleProviderSyncs();
    const probeTimer = setInterval(scheduleNodeProbes, NODE_PROBE_INTERVAL_MS);
    const syncTimer = setInterval(scheduleProviderSyncs, PROVIDER_SYNC_INTERVAL_MS);
    // ── Graceful shutdown ──────────────────────────────────────────────────────
    process.on('SIGINT', async () => {
        logger.info('shutting down workers');
        clearInterval(probeTimer);
        clearInterval(syncTimer);
        await Promise.all([
            telemetryWorker.close(),
            syncWorker.close(),
            alertWorker.close(),
            telemetryQueue.close(),
            syncQueue.close(),
            alertQueue.close(),
            connection.quit(),
        ]);
        process.exit(0);
    });
}
bootstrap().catch((error) => {
    logger.error({ error }, 'worker bootstrap failed');
    process.exit(1);
});
