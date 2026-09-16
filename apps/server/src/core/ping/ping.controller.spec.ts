import { Test, TestingModule } from '@nestjs/testing';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';

describe('PingController', () => {
  let controller: PingController;
  let service: PingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
      providers: [PingService],
    }).compile();

    controller = module.get<PingController>(PingController);
    service = module.get<PingService>(PingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ping', () => {
    it('should call pingService.ping and return its result', () => {
      const mockResult = {
        message: 'pong',
        timestamp: '2026-09-15T12:00:00.000Z',
      };
      jest.spyOn(service, 'ping').mockReturnValue(mockResult);

      const result = controller.ping();

      expect(result).toBe(mockResult);
      expect(service.ping).toHaveBeenCalledTimes(1);
    });
  });
});
