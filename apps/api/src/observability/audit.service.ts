import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a security-sensitive action to the audit logs.
   * @param userId - The ID of the user performing the action.
   * @param action - The action string (e.g. 'CREATE_NODE', 'UPDATE_PLAN').
   * @param targetType - The entity type (e.g. 'Node', 'Plan').
   * @param targetId - The specific ID of the entity acted upon.
   * @param metadata - Optional key-value metadata for the action.
   */
  async recordAction(
    userId: string,
    action: string,
    targetType: string,
    targetId: string,
    metadata?: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          targetType,
          targetId,
          metadata: metadata || null,
        },
      });
      this.logger.log(`Audit Log: User ${userId} performed ${action} on ${targetType}:${targetId}`);
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`, err.stack);
    }
  }
}
