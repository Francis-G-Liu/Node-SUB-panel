import { Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../../auth/roles.decorator';
import { NodesService } from '../../nodes/nodes.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { TicketsService } from '../../tickets/tickets.service';
import { NodeModel } from '../models/node.model';
import { PlanModel } from '../models/plan.model';
import { TicketModel } from '../models/ticket.model';

@Resolver()
@Roles('super_admin', 'ops', 'support')
export class CatalogResolver {
  constructor(
    private readonly nodesService: NodesService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly ticketsService: TicketsService,
  ) {}

  @Query(() => [NodeModel])
  async nodesSnapshot() {
    const result = await this.nodesService.list({ page: 1, pageSize: 100 });
    return result.data.map((node) => ({
      id: node.id,
      providerId: node.providerId,
      hostname: node.hostname,
      region: node.region,
      tags: (node.tags as string[]) || [],
      latencyMs: node.health?.latencyMs ?? null,
    }));
  }

  @Query(() => [PlanModel])
  plansSnapshot() {
    return this.subscriptionsService.listPlans();
  }

  @Query(() => [TicketModel])
  async openTickets() {
    const result = await this.ticketsService.listForAdmin({ pageSize: 200 });
    return result.data.filter((ticket) => ticket.status !== 'resolved');
  }
}
