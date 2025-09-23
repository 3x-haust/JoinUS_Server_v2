import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log, LogAction, LogTargetType } from './entities/log.entity';
import { RedisService } from '../infra/redis/redis.service';
import { CreateLogCommand } from './commands/create-log.command';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly redisService: RedisService,
    private readonly commandBus: CommandBus,
  ) {}

  async findAll(): Promise<Log[]> {
    const cacheKey = 'logs:all';

    const cached = await this.redisService.getObject<Log[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const logs = await this.logRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    await this.redisService.setObject(cacheKey, logs, 180);

    return logs;
  }

  async findByUserId(userId: number): Promise<Log[]> {
    const cacheKey = `logs:user:${userId}`;

    const cached = await this.redisService.getObject<Log[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const logs = await this.logRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    await this.redisService.setObject(cacheKey, logs, 300);

    return logs;
  }

  async findRecentLogs(limit: number = 100): Promise<Log[]> {
    const cacheKey = `logs:recent:${limit}`;

    const cached = await this.redisService.getObject<Log[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const logs = await this.logRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    await this.redisService.setObject(cacheKey, logs, 120);

    return logs;
  }

  async createLog(
    userId: number,
    action: LogAction,
    targetType: LogTargetType,
    targetId?: number,
    description?: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new CreateLogCommand(userId, action, targetType, targetId, description),
    );
  }
}
