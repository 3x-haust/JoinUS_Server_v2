import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { GetClubListQuery } from '../queries/get-club-list.query';
import { Club } from '../entities/club.entity';
import { RedisService } from '../../infra/redis/redis.service';

@QueryHandler(GetClubListQuery)
export class GetClubListHandler implements IQueryHandler<GetClubListQuery> {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetClubListQuery): Promise<Club[]> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const cacheKey = `clubs:list:${page}:${limit}:${search || 'all'}`;
    const cached = await this.redisService.getObject<Club[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const whereCondition = search
      ? [{ name: Like(`%${search}%`) }, { description: Like(`%${search}%`) }]
      : {};

    const clubs = await this.clubRepository.find({
      where: whereCondition,
      relations: ['teacher'],
      order: { id: 'DESC' },
      take: limit,
      skip: skip,
    });

    await this.redisService.setObject(cacheKey, clubs, 300);
    return clubs;
  }
}
