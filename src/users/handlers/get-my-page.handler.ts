import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMyPageQuery } from '../queries/get-my-page.query';
import { User } from '../entities/user.entity';
import { RedisService } from '../../infra/redis/redis.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetMyPageQuery)
export class GetMyPageHandler implements IQueryHandler<GetMyPageQuery> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetMyPageQuery): Promise<User> {
    const { userId } = query;

    const cacheKey = `user:mypage:${userId}`;
    const cached = await this.redisService.getObject<User>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'teachingClubs',
        'joinedClubs',
        'joinedClubs.teacher',
        'bookmarkedClubs',
        'bookmarkedClubs.teacher',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisService.setObject(cacheKey, user, 300);
    return user;
  }
}
