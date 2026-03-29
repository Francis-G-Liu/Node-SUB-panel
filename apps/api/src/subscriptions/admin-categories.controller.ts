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

@Controller('categories')
@Roles('super_admin', 'ops')
export class AdminCategoriesController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  list() {
    return this.subscriptionsService.listCategories();
  }

  @Post()
  create(@Body() data: any) {
    return this.subscriptionsService.createCategory(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.subscriptionsService.updateCategory(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.subscriptionsService.deleteCategory(id);
  }
}
