import { Injectable, Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import { PrismaService } from '../database/prisma.service';
import { NotificationClient } from './notification-client';

interface AlertRule {
  id: string;
  name: string;
  channel: 'telegram' | 'email';
  severity: 'warning' | 'critical';
  target: string;
  regionFilter?: string | null;
  tagFilter?: string | null;
  thresholdLatencyMs?: number | null;
  thresholdPacketLoss?: number | null;
}

interface TelemetrySample {
  latencyMs: number | null;
  packetLoss: number;
}

/** Cooldown period in milliseconds: same rule won't fire again within this window. */
const ALERT_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly nodeStream = new Subject<{
    data: { type: string; payload: unknown };
  }>();
  private readonly alertStream = new Subject<{
    data: { type: string; payload: unknown };
  }>();

  /**
   * Fix #3 (alert flooding): map from ruleId → last-sent timestamp.
   * Alerts for the same rule are suppressed within ALERT_COOLDOWN_MS.
   */
  private readonly alertCooldowns = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifier: NotificationClient,
  ) {}

  async recordSample(sample: {
    nodeId: string;
    latencyMs: number | null;
    packetLoss: number;
    timestamp: string;
  }) {
    const node = await this.prisma.node.findUnique({
      where: { id: sample.nodeId },
    });
    if (!node) return;

    const telemetry = await this.prisma.telemetrySample.create({
      data: {
        nodeId: sample.nodeId,
        latencyMs: sample.latencyMs,
        packetLoss: sample.packetLoss,
        timestamp: new Date(sample.timestamp),
      },
    });

    await this.prisma.node.update({
      where: { id: sample.nodeId },
      data: {
        online: sample.latencyMs !== null,
        lastCheckedAt: new Date(sample.timestamp),
      },
    });

    const availability = sample.latencyMs === null ? 0 : 1 - sample.packetLoss;
    this.nodeStream.next({
      data: { type: 'telemetry', payload: { ...sample, availability } },
    });

    await this.evaluateAlerts(
      node.region,
      (node.tags as string[]) || [],
      telemetry,
    );
  }

  async triggerManualAlert(rule: AlertRule, message: string) {
    // Manual triggers bypass cooldown
    await this.dispatchAlert(rule, message, true);
  }

  listSamples(nodeId: string) {
    return this.prisma.telemetrySample.findMany({
      where: { nodeId },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }

  nodeObservable() {
    return this.nodeStream.asObservable();
  }

  alertObservable() {
    return this.alertStream.asObservable();
  }

  private async evaluateAlerts(
    region: string,
    tags: string[],
    sample: TelemetrySample,
  ) {
    const rules = (await this.prisma.alertRule.findMany()) as AlertRule[];
    for (const rule of rules) {
      if (rule.regionFilter && rule.regionFilter !== region) continue;
      if (rule.tagFilter && !tags.includes(rule.tagFilter)) continue;

      let triggered = false;
      if (
        rule.thresholdLatencyMs &&
        sample.latencyMs !== null &&
        sample.latencyMs > rule.thresholdLatencyMs
      ) {
        triggered = true;
      }
      if (
        rule.thresholdPacketLoss &&
        sample.packetLoss > rule.thresholdPacketLoss
      ) {
        triggered = true;
      }
      if (sample.latencyMs === null && rule.severity === 'critical') {
        triggered = true;
      }

      if (triggered) {
        const message = `节点告警: latency=${sample.latencyMs ?? 'timeout'}ms loss=${Math.round(sample.packetLoss * 100)}%`;
        await this.dispatchAlert(rule, message);
      }
    }
  }

  /**
   * @param bypassCooldown - set true for manual triggers to always send
   */
  private async dispatchAlert(
    rule: AlertRule,
    message: string,
    bypassCooldown = false,
  ) {
    const now = Date.now();

    // Fix #3: enforce cooldown to prevent alert flooding
    if (!bypassCooldown) {
      const lastSent = this.alertCooldowns.get(rule.id);
      if (lastSent && now - lastSent < ALERT_COOLDOWN_MS) {
        this.logger.debug(`Alert suppressed (cooldown): ${rule.name}`);
        return;
      }
    }

    this.alertCooldowns.set(rule.id, now);

    if (rule.channel === 'telegram') {
      await this.notifier.sendTelegram(rule.target, message);
    }
    if (rule.channel === 'email') {
      await this.notifier.sendEmail(rule.target, `告警: ${rule.name}`, message);
    }
    this.alertStream.next({
      data: {
        type: 'alert',
        payload: { ...rule, message, triggeredAt: new Date().toISOString() },
      },
    });
    this.logger.warn(`Alert sent: ${rule.name}`);
  }
}
