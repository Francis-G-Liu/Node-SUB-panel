import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { Roles } from '../auth/roles.decorator';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('providers')
@Roles('super_admin', 'ops')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  async list() {
    const providers = await this.providersService.list();
    return providers.map((p) => ({
      id: p.id,
      name: p.name,
      url: p.subscriptionUrl,
      region: p.regionHint,
      interval: p.syncIntervalMinutes,
      lastSync: p.lastSyncAt,
      tags: p.tags,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const p = await this.providersService.getById(id);
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      url: p.subscriptionUrl,
      region: p.regionHint,
      interval: p.syncIntervalMinutes,
      lastSync: p.lastSyncAt,
      tags: p.tags,
    };
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateProviderDto) {
    return this.providersService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providersService.update(id, dto, user.id);
  }

  @Delete(':id')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.providersService.delete(id, user.id);
  }

  @Post(':id/sync')
  sync(@CurrentUser() user: any, @Param('id') id: string) {
    return this.providersService.sync(id, user.id);
  }
}
