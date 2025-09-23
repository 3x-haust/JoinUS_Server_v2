import { Injectable } from '@nestjs/common';
import { RedisService } from '../../infra/redis/redis.service';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  timeout: number;
  resetTimeout: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    timeout: 60000,
    resetTimeout: 30000,
  };

  constructor(private readonly redisService: RedisService) {}

  async executeWithCircuitBreaker<T>(
    key: string,
    operation: () => Promise<T>,
    config: Partial<CircuitBreakerConfig> = {},
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const state = await this.getCircuitState(key);

    switch (state) {
      case CircuitState.OPEN: {
        const shouldTryHalfOpen = await this.shouldTryHalfOpen(
          key,
          finalConfig,
        );
        if (!shouldTryHalfOpen) {
          throw new Error(
            'Circuit breaker is OPEN - service temporarily unavailable',
          );
        }
        await this.setCircuitState(key, CircuitState.HALF_OPEN);
        return this.executeOperation(key, operation, finalConfig);
      }

      case CircuitState.HALF_OPEN:
        return this.executeOperation(key, operation, finalConfig);

      case CircuitState.CLOSED:
      default:
        return this.executeOperation(key, operation, finalConfig);
    }
  }

  private async executeOperation<T>(
    key: string,
    operation: () => Promise<T>,
    config: CircuitBreakerConfig,
  ): Promise<T> {
    try {
      const result = await operation();
      await this.recordSuccess(key);
      return result;
    } catch (error) {
      await this.recordFailure(key, config);
      throw error;
    }
  }

  private async getCircuitState(key: string): Promise<CircuitState> {
    const state = await this.redisService.get(`circuit:${key}:state`);
    return (state as CircuitState) || CircuitState.CLOSED;
  }

  private async setCircuitState(
    key: string,
    state: CircuitState,
  ): Promise<void> {
    await this.redisService.set(`circuit:${key}:state`, state, 300);
  }

  private async getFailureCount(key: string): Promise<number> {
    const count = await this.redisService.get(`circuit:${key}:failures`);
    return count ? parseInt(count, 10) : 0;
  }

  private async incrementFailureCount(key: string): Promise<number> {
    const luaScript = `
      local key = KEYS[1]
      local current = redis.call('GET', key)
      local count = 1
      
      if current then
        count = tonumber(current) + 1
      end
      
      redis.call('SET', key, count, 'EX', 300)
      return count
    `;

    const result = (await this.redisService.eval(
      luaScript,
      1,
      `circuit:${key}:failures`,
    )) as number | string;
    return typeof result === 'number' ? result : parseInt(result, 10);
  }

  private async recordSuccess(key: string): Promise<void> {
    const state = await this.getCircuitState(key);

    if (state === CircuitState.HALF_OPEN) {
      await this.setCircuitState(key, CircuitState.CLOSED);
      await this.redisService.del(`circuit:${key}:failures`);
      await this.redisService.del(`circuit:${key}:opened_at`);
    } else if (state === CircuitState.CLOSED) {
      await this.redisService.del(`circuit:${key}:failures`);
    }
  }

  private async recordFailure(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    const failureCount = await this.incrementFailureCount(key);

    if (failureCount >= config.failureThreshold) {
      await this.setCircuitState(key, CircuitState.OPEN);
      await this.redisService.set(
        `circuit:${key}:opened_at`,
        Date.now().toString(),
        Math.ceil(config.resetTimeout / 1000),
      );
    }
  }

  private async shouldTryHalfOpen(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<boolean> {
    const openedAt = await this.redisService.get(`circuit:${key}:opened_at`);

    if (!openedAt) {
      return true;
    }

    const openedTime = parseInt(openedAt, 10);
    const now = Date.now();

    return now - openedTime >= config.resetTimeout;
  }

  async executeClubApplication<T>(operation: () => Promise<T>): Promise<T> {
    return this.executeWithCircuitBreaker('club-application', operation, {
      failureThreshold: 10,
      timeout: 120000,
      resetTimeout: 60000,
    });
  }
}
