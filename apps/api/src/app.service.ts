import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      service: 'airport-api',
      version: process.env.GIT_SHA ?? 'dev',
      timestamp: new Date().toISOString(),
    };
  }
}
