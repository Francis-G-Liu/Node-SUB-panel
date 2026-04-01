import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import { TicketsService } from './tickets.service';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('tickets')
@Roles('super_admin', 'ops', 'support')
export class TicketsAdminController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Get()
  async list(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const normalizedStatus =
      status && ['open', 'pending', 'resolved'].includes(status)
        ? (status as TicketStatus)
        : undefined;
    const result = await this.ticketsService.listForAdmin({
      status: normalizedStatus,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });

    return {
      ...result,
      data: result.data.map((t: any) => ({
        id: t.id,
        subject: t.subject,
        priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
        status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
        node: t.nodeId || 'N/A',
        createdAt: t.createdAt,
      })),
    };
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body()
    body: {
      status?: 'open' | 'pending' | 'resolved';
      priority?: 'low' | 'medium' | 'high' | 'critical';
    },
  ) {
    return this.ticketsService.updateTicket(id, body, user.id);
  }

  @Post(':id/reply')
  reply(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { body: string },
  ) {
    return this.ticketsService.replyTicket(id, {
      body: body.body,
      userId: user.id,
    });
  }
}
