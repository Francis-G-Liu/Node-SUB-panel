import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@Roles('super_admin', 'ops', 'support')
export class AdminUsersController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async listUsers() {
    const users = await this.subscriptionsService.listUsers();
    return {
      data: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        nickname: u.displayName,
        role: u.role,
        status: 'Active',
      })),
      total: users.length,
    };
  }

  @Post()
  @Roles('super_admin', 'ops')
  createUser(@Body() data: any) {
    return this.subscriptionsService.createUser(data);
  }

  @Patch(':id')
  @Roles('super_admin', 'ops')
  updateUser(@Param('id') id: string, @Body() data: any) {
    return this.subscriptionsService.updateUser(id, data);
  }

  @Delete(':id')
  @Roles('super_admin')
  deleteUser(@Param('id') id: string) {
    return this.subscriptionsService.deleteUser(id);
  }
}
