import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { compareSync, hashSync } from 'bcryptjs';
import type { UserRole } from '../domain/entities';

interface JwtPayload {
  sub: string;
  role: UserRole;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  private failedAttempts = new Map<
    string,
    { count: number; lastAttempt: number }
  >();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_TIME = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateToken(token?: string) {
    if (!token) throw new UnauthorizedException('Missing token');
    const normalized = token.replace(/^Bearer\s+/i, '').trim();
    if (!normalized) throw new UnauthorizedException('Invalid token');

    const jwtUser = await this.tryJwt(normalized);
    if (jwtUser) return jwtUser;

    const hashed = this.hashToken(normalized);
    const user = await this.prisma.user.findFirst({
      where: { apiToken: hashed },
    });
    if (!user) throw new UnauthorizedException('Invalid token');
    return user;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async login(email: string, password: string) {
    const now = Date.now();
    const attempts = this.failedAttempts.get(email);

    if (attempts && attempts.count >= this.MAX_ATTEMPTS) {
      if (now - attempts.lastAttempt < this.LOCK_TIME) {
        throw new UnauthorizedException(
          'Account locked. Please try again later.',
        );
      } else {
        // Reset after lock time passed
        this.failedAttempts.delete(email);
      }
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !compareSync(password, user.passwordHash)) {
      const current = this.failedAttempts.get(email) || {
        count: 0,
        lastAttempt: 0,
      };
      this.failedAttempts.set(email, {
        count: current.count + 1,
        lastAttempt: now,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    this.failedAttempts.delete(email); // Clear on success
    const tokens = await this.issueTokens(user.id, user.role);
    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyToken(refreshToken, 'refresh');
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.refreshTokenHash)
      throw new UnauthorizedException('Invalid refresh token');
    if (!compareSync(refreshToken, user.refreshTokenHash))
      throw new UnauthorizedException('Invalid refresh token');
    return this.issueTokens(user.id, user.role);
  }

  async issueTokens(userId: string, role: UserRole) {
    const accessToken = this.jwtService.sign(
      { sub: userId, role, type: 'access' },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, role, type: 'refresh' },
      { expiresIn: '7d' },
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hashSync(refreshToken, 10) },
    });
    return { accessToken, refreshToken };
  }

  private verifyToken(token: string, type: JwtPayload['type']) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.type !== type)
        throw new UnauthorizedException('Invalid token type');
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async tryJwt(token: string) {
    if (token.split('.').length !== 3) return null;
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (payload.type !== 'access') return null;
      return await this.prisma.user.findUnique({ where: { id: payload.sub } });
    } catch {
      return null;
    }
  }
}
