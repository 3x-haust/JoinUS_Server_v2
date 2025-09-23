import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisHost: string = this.configService.redisHost;
    const redisPort: number = this.configService.redisPort;

    if (!redisHost || !redisPort) {
      throw new Error('Invalid Redis configuration');
    }

    this.client = new Redis({
      host: redisHost,
      port: redisPort,
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl = 60) {
    await this.client.set(key, value, 'EX', ttl);
  }

  async setNX(key: string, value: string, ttl?: number): Promise<boolean> {
    if (ttl) {
      const result = await this.client.set(key, value, 'EX', ttl, 'NX');
      return result === 'OK';
    } else {
      const result = await this.client.setnx(key, value);
      return result === 1;
    }
  }

  async eval(script: string, numKeys: number, ...args: string[]): Promise<any> {
    return await this.client.eval(script, numKeys, ...args);
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async setObject<T>(key: string, value: T, ttl = 60): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async getObject<T>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    return result ? (JSON.parse(result) as T) : null;
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async publish(channel: string, message: string) {
    await this.client.publish(channel, message);
  }
}
