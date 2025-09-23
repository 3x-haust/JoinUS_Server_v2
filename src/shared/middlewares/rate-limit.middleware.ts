import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../infra/redis/redis.service';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path.includes('/clubs') && req.method === 'POST') {
      return this.applyRateLimit(req, res, next, {
        windowMs: 60 * 1000,
        maxRequests: 3,
        keyGenerator: (req) =>
          `rate_limit:club_apply:${req.ip}:${(req.user as { id?: string })?.id || 'anonymous'}`,
      });
    }

    return this.applyRateLimit(req, res, next, {
      windowMs: 60 * 1000,
      maxRequests: 100,
      keyGenerator: (req) => `rate_limit:general:${req.ip}`,
    });
  }

  private async applyRateLimit(
    req: Request,
    res: Response,
    next: NextFunction,
    options: RateLimitOptions,
  ) {
    const key = options.keyGenerator
      ? options.keyGenerator(req)
      : `rate_limit:${req.ip}`;
    const currentTime = Date.now();
    const windowStart = currentTime - options.windowMs;

    try {
      const luaScript = `
        local key = KEYS[1]
        local window_start = tonumber(ARGV[1])
        local current_time = tonumber(ARGV[2])
        local max_requests = tonumber(ARGV[3])
        local window_ms = tonumber(ARGV[4])

        redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

        local current_count = redis.call('ZCARD', key)

        if current_count < max_requests then
          redis.call('ZADD', key, current_time, current_time)
          redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
          return {current_count + 1, max_requests, math.ceil((window_start + window_ms - current_time) / 1000)}
        else
          local oldest_request = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')[2]
          local reset_time = math.ceil((oldest_request + window_ms - current_time) / 1000)
          return {current_count, max_requests, reset_time}
        end
      `;

      const result = (await this.redisService.eval(
        luaScript,
        1,
        key,
        windowStart.toString(),
        currentTime.toString(),
        options.maxRequests.toString(),
        options.windowMs.toString(),
      )) as number[];

      const [currentCount, maxRequests, resetTimeSeconds] = result;

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader(
        'X-RateLimit-Remaining',
        Math.max(0, maxRequests - currentCount),
      );
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(currentTime + resetTimeSeconds * 1000).toISOString(),
      );

      if (currentCount > maxRequests) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: '요청 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: resetTimeSeconds,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Rate limiting error:', error);
      next();
    }
  }
}
