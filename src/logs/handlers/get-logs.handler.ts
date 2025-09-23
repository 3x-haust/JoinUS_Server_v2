import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import {
  GetLogsByUserQuery,
  GetLogsByClubQuery,
  GetLogsByActionQuery,
  GetAllLogsQuery,
} from '../queries/get-logs.query';
import { Log, LogAction, LogTargetType } from '../entities/log.entity';
import { RedisService } from '../../infra/redis/redis.service';

@QueryHandler(GetLogsByUserQuery)
export class GetLogsByUserHandler implements IQueryHandler<GetLogsByUserQuery> {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetLogsByUserQuery): Promise<Log[]> {
    const { userId, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const cacheKey = `logs:user:${userId}:${page}:${limit}`;
    const cached = await this.redisService.getObject<Log[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const logs = await this.logRepository.find({
      where: { userId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    await this.redisService.setObject(cacheKey, logs, 300);
    return logs;
  }
}

@QueryHandler(GetLogsByClubQuery)
export class GetLogsByClubHandler implements IQueryHandler<GetLogsByClubQuery> {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetLogsByClubQuery): Promise<Log[]> {
    const { clubId, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const cacheKey = `logs:club:${clubId}:${page}:${limit}`;
    const cached = await this.redisService.getObject<Log[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const logs = await this.logRepository.find({
      where: { targetId: clubId, targetType: LogTargetType.CLUB },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    await this.redisService.setObject(cacheKey, logs, 300);
    return logs;
  }
}

@QueryHandler(GetLogsByActionQuery)
export class GetLogsByActionHandler
  implements IQueryHandler<GetLogsByActionQuery>
{
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetLogsByActionQuery): Promise<Log[]> {
    const { action, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const cacheKey = `logs:action:${action}:${page}:${limit}`;
    const cached = await this.redisService.getObject<Log[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const logs = await this.logRepository.find({
      where: { action: action as LogAction },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    await this.redisService.setObject(cacheKey, logs, 300);
    return logs;
  }
}

@QueryHandler(GetAllLogsQuery)
export class GetAllLogsHandler implements IQueryHandler<GetAllLogsQuery> {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetAllLogsQuery): Promise<Log[]> {
    const { page = 1, limit = 50, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const cacheKey = `logs:all:${page}:${limit}:${startDate?.getTime() || 'null'}:${endDate?.getTime() || 'null'}`;
    const cached = await this.redisService.getObject<Log[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const whereCondition: FindOptionsWhere<Log> = {};
    if (startDate && endDate) {
      whereCondition.createdAt = Between(startDate, endDate);
    }

    const logs = await this.logRepository.find({
      where: whereCondition,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    await this.redisService.setObject(cacheKey, logs, 180);
    return logs;
  }
}
