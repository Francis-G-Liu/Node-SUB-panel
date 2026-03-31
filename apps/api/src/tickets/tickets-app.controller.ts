import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import type { UserEntity } from '../domain/entities';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('user/tickets')
export class TicketsAppController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  list(@CurrentUser() user: UserEntity) {
    return this.ticketsService.listForUser(user.id);
  }

  @Get(':id')
  async detail(@CurrentUser() user: UserEntity, @Param('id') id: string) {
    const tickets = await this.ticketsService.listForUser(user.id);
    return tickets.find((t: any) => t.id === id) ?? null;
  }

  @Post()
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(user, dto);
  }

  @Post(':id/reply')
  reply(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Body() body: { body: string },
  ) {
    return this.ticketsService.replyTicketAsUser(id, user.id, body.body);
  }
}
