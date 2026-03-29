import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import type { UserEntity } from '../domain/entities';

@Controller('me')
export class MeController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  profile(@CurrentUser() user: UserEntity) {
    const safeUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
    return this.subscriptionsService.getUserProfile(safeUser);
  }
}
