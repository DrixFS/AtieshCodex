import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { REDIS_CLIENT } from './redis.constants';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    exists: jest.Mock;
    ttl: jest.Mock;
    ping: jest.Mock;
    quit: jest.Mock;
    disconnect: jest.Mock;
  };

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn().mockResolvedValue('OK'),
      disconnect: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.getClient()).toBe(mockRedisClient);
  });

  describe('get & getJson', () => {
    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('non-existent');
      expect(result).toBeNull();
      expect(mockRedisClient.get).toHaveBeenCalledWith('non-existent');
    });

    it('should return raw string from get', async () => {
      mockRedisClient.get.mockResolvedValue('raw-value');

      const result = await service.get('text-key');
      expect(result).toBe('raw-value');
    });

    it('should return parsed JSON value from getJson when valid JSON', async () => {
      const mockData = { id: 1, name: 'Stormwind' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockData));

      const result = await service.getJson<{ id: number; name: string }>('realm:1');
      expect(result).toEqual(mockData);
    });

    it('should return null from getJson if JSON parsing fails', async () => {
      mockRedisClient.get.mockResolvedValue('invalid-json');

      const result = await service.getJson('text-key');
      expect(result).toBeNull();
    });

    it('should return null from getJson when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.getJson('missing-key');
      expect(result).toBeNull();
    });
  });

  describe('set & setJson', () => {
    it('should store string value directly', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      const result = await service.set('key', 'simple-val');
      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'simple-val');
    });

    it('should serialize object to JSON via setJson', async () => {
      mockRedisClient.set.mockResolvedValue('OK');
      const payload = { active: true };

      const result = await service.setJson('key', payload);
      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key', JSON.stringify(payload));
    });

    it('should pass TTL parameter when provided', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      const result = await service.set('key', 'val', 60);
      expect(result).toBe('OK');
      expect(mockRedisClient.set).toHaveBeenCalledWith('key', 'val', 'EX', 60);
    });
  });

  describe('del & exists & ttl & ping', () => {
    it('should delete keys when provided', async () => {
      mockRedisClient.del.mockResolvedValue(2);

      const result = await service.del('key1', 'key2');
      expect(result).toBe(2);
      expect(mockRedisClient.del).toHaveBeenCalledWith('key1', 'key2');
    });

    it('should return 0 when no keys to delete', async () => {
      const result = await service.del();
      expect(result).toBe(0);
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });

    it('should check key existence', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await service.exists('key1');
      expect(result).toBe(1);
    });

    it('should return 0 when checking existence with no keys', async () => {
      const result = await service.exists();
      expect(result).toBe(0);
    });

    it('should retrieve ttl for key', async () => {
      mockRedisClient.ttl.mockResolvedValue(300);

      const result = await service.ttl('key1');
      expect(result).toBe(300);
    });

    it('should ping redis', async () => {
      mockRedisClient.ping.mockResolvedValue('PONG');

      const result = await service.ping();
      expect(result).toBe('PONG');
    });
  });

  describe('onApplicationShutdown', () => {
    it('should quit client gracefully', async () => {
      await service.onApplicationShutdown();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });

    it('should force disconnect if quit throws', async () => {
      mockRedisClient.quit.mockRejectedValue(new Error('Quit failed'));

      await service.onApplicationShutdown();
      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });
  });
});
