import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NodesService } from './nodes.service';
import { Roles } from '../auth/roles.decorator';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('nodes')
@Roles('super_admin', 'ops', 'support', 'auditor')
export class NodesAdminController {
  constructor(private readonly nodesService: NodesService) {}

  @Get()
  async list(
    @Query('region') region?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const result = await this.nodesService.list({
      region,
      tag,
      search,
      page: Number(page),
      pageSize: Number(pageSize),
    });

    return {
      ...result,
      data: result.data.map((node: any) => ({
        id: node.id,
        protocol: node.protocol,
        host: node.hostname,
        port: node.port,
        region: node.region,
        status: node.online ? 'online' : 'offline',
        active: node.active,
        latency: node.health?.latencyMs ?? 0,
        packetLoss: node.health?.packetLoss ?? 0,
        tags: node.tags,
      })),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const node = await this.nodesService.getById(id);
    if (!node) return null;
    return {
      id: node.id,
      protocol: node.protocol,
      host: node.hostname,
      port: node.port,
      region: node.region,
      status: node.online ? 'online' : 'offline',
      active: node.active,
      latency: node.health?.latencyMs ?? 0,
      packetLoss: node.health?.packetLoss ?? 0,
      tags: node.tags,
    };
  }

  @Get(':id/metrics')
  async metrics(@Param('id') id: string) {
    return { nodeId: id, samples: await this.nodesService.getMetrics(id) };
  }

  @Post()
  @Roles('super_admin', 'ops')
  create(@CurrentUser() user: any, @Body() body: CreateNodeDto) {
    return this.nodesService.create(
      {
        providerId: body.providerId,
        hostname: body.hostname.trim(),
        port: body.port,
        protocol: body.protocol,
        region: body.region.trim(),
        tags: body.tags ?? [],
        active: body.active,
        maxBandwidthMbps: body.maxBandwidthMbps,
      },
      user.id,
    );
  }

  @Patch(':id')
  @Roles('super_admin', 'ops')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: UpdateNodeDto,
  ) {
    return this.nodesService.update(
      id,
      {
        hostname: body.hostname?.trim(),
        port: body.port,
        protocol: body.protocol,
        region: body.region?.trim(),
        tags: body.tags,
        active: body.active,
        maxBandwidthMbps: body.maxBandwidthMbps,
      },
      user.id,
    );
  }

  @Delete(':id')
  @Roles('super_admin', 'ops')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.nodesService.delete(id, user.id);
  }
}
