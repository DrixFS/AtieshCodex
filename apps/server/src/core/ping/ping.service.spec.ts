import { Test, TestingModule } from '@nestjs/testing';
import { PingService } from './ping.service';

describe('PingService', () => {
  let service: PingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PingService],
    }).compile();

    service = module.get<PingService>(PingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ping', () => {
    it('should return pong message and a valid timestamp', () => {
      const result = service.ping();

      expect(result).toBeDefined();
      expect(result.message).toBe('pong');
      expect(typeof result.timestamp).toBe('string');
      expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
    });
  });
});
