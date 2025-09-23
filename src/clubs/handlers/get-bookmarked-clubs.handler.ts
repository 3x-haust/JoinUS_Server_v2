import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetBookmarkedClubsQuery } from '../queries/get-bookmarked-clubs.query';
import { User } from '../../users/entities/user.entity';
import { Club } from '../entities/club.entity';
import { RedisService } from '../../infra/redis/redis.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetBookmarkedClubsQuery)
export class GetBookmarkedClubsHandler
  implements IQueryHandler<GetBookmarkedClubsQuery>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetBookmarkedClubsQuery): Promise<Club[]> {
    const { userId } = query;

    const cacheKey = `user:${userId}:bookmarked-clubs`;
    const cached = await this.redisService.getObject<Club[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarkedClubs', 'bookmarkedClubs.teacher'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisService.setObject(cacheKey, user.bookmarkedClubs, 600);
    return user.bookmarkedClubs;
  }
}
