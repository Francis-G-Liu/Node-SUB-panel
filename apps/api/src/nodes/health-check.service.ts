import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { TelemetryService } from '../observability/telemetry.service';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class HealthCheckService implements OnModuleInit {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetry: TelemetryService,
  ) {}

  onModuleInit() {
    this.logger.log('HealthCheckService initialized');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running scheduled health check for all active nodes...');
    const nodes = await this.prisma.node.findMany({
      where: { active: true },
    });

    for (const node of nodes) {
      this.checkNode(node);
    }
  }

  private async checkNode(node: any) {
    try {
      // Use system ping command with execFile to prevent OS command injection.
      const isWindows = process.platform === 'win32';
      const cmd = 'ping';
      const args = isWindows
        ? ['-n', '1', node.hostname]
        : ['-c', '1', node.hostname];

      const startTime = Date.now();
      try {
        const { stdout } = await execFileAsync(cmd, args);
        const latencyMs = Date.now() - startTime;

        // Basic parsing for average latency if needed, but Date.now diff is a good fallback
        // for simple reachability checks.
        let parsedLatency = latencyMs;

        // Regex for "Average = Xms" or "time=X ms"
        const avgMatch = isWindows
          ? stdout.match(/Average = (\d+)ms/)
          : stdout.match(/time=(\d+(\.\d+)?)\s+ms/);

        if (avgMatch) {
          parsedLatency = Math.round(parseFloat(avgMatch[1]));
        }

        await this.telemetry.recordSample({
          nodeId: node.id,
          latencyMs: parsedLatency,
          packetLoss: 0,
          timestamp: new Date().toISOString(),
        });

        this.logger.debug(`Ping ${node.hostname} SUCCESS: ${parsedLatency}ms`);
      } catch (err) {
        // Ping failed or timeout
        await this.telemetry.recordSample({
          nodeId: node.id,
          latencyMs: null,
          packetLoss: 1,
          timestamp: new Date().toISOString(),
        });
        this.logger.warn(
          `Ping ${node.hostname} FAILED (Timeout or Unreachable)`,
        );
      }
    } catch (err) {
      this.logger.error(`Health check error for ${node.hostname}: ${err}`);
    }
  }
}
