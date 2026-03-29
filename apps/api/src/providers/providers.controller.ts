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
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.providersService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.providersService.delete(id);
  }

  @Post(':id/sync')
  sync(@Param('id') id: string) {
    return this.providersService.sync(id);
  }
}
