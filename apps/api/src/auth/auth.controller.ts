import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';
import { Throttle } from '@nestjs/throttler';
import type { UserEntity } from '../domain/entities';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post()
  async login(@Body() dto: { username: string; password: string }) {
    const result = await this.authService.login(dto.username, dto.password);
    return {
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        nickname: result.user.displayName,
        role: result.user.role,
        status: 'Active',
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  me(@CurrentUser() user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    };
  }
}
