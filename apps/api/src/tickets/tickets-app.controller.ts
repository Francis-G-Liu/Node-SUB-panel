import { Body, Controller, Get, Post } from '@nestjs/common';
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

  @Post()
  create(@CurrentUser() user: UserEntity, @Body() dto: CreateTicketDto) {
    return this.ticketsService.createTicket(user, dto);
  }
}
