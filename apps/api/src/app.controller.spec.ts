import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return service health status', () => {
      const result = appController.health();
      expect(result).toBeDefined();
      expect(result.service).toBe('airport-api');
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });
  });
});
