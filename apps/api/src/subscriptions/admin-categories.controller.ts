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
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('categories')
@Roles('super_admin', 'ops')
export class AdminCategoriesController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  list() {
    return this.subscriptionsService.listCategories();
  }

  @Post()
  create(@CurrentUser() user: any, @Body() data: any) {
    return this.subscriptionsService.createCategory(data, user.id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() data: any) {
    return this.subscriptionsService.updateCategory(id, data, user.id);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subscriptionsService.deleteCategory(id, user.id);
  }
}
