import { Controller, Get } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { UserEntity } from '../domain/entities';

@Controller('user/nodes')
export class NodesAppController {
  constructor(private readonly nodesService: NodesService) {}

  @Get()
  list(@CurrentUser() user: UserEntity) {
    return this.nodesService.listForUser(user.id);
  }
}
