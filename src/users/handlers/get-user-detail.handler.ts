import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserDetailQuery } from '../queries/get-user-detail.query';
import { User } from '../entities/user.entity';
import { RedisService } from '../../infra/redis/redis.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetUserDetailQuery)
export class GetUserDetailHandler implements IQueryHandler<GetUserDetailQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetUserDetailQuery): Promise<User> {
    const { userId } = query;

    const cacheKey = `user:detail:${userId}`;
    const cached = await this.redisService.getObject<User>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['teachingClubs', 'joinedClubs', 'bookmarkedClubs'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisService.setObject(cacheKey, user, 600);
    return user;
  }
}
