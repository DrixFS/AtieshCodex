import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleDestroy } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy, OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async getJson<T = unknown>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    if (ttlSeconds && ttlSeconds > 0) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<'OK' | null> {
    const serialized = JSON.stringify(value);
    return this.set(key, serialized, ttlSeconds);
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }
    return this.client.del(...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }
    return this.client.exists(...keys);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeConnection();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.closeConnection();
  }

  private async closeConnection(): Promise<void> {
    this.logger.log('Closing Redis connection...');
    try {
      await this.client.quit();
      this.logger.log('Redis connection closed gracefully.');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
      this.client.disconnect();
    }
  }
}
