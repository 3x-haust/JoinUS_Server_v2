import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMyAppliedClubsQuery } from '../queries/get-my-applied-clubs.query';
import { User } from '../../users/entities/user.entity';
import { Club } from '../entities/club.entity';
import { RedisService } from '../../infra/redis/redis.service';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetMyAppliedClubsQuery)
export class GetMyAppliedClubsHandler
  implements IQueryHandler<GetMyAppliedClubsQuery>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async execute(query: GetMyAppliedClubsQuery): Promise<Club[]> {
    const { userId } = query;

    const cacheKey = `user:${userId}:applied-clubs`;
    const cached = await this.redisService.getObject<Club[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['joinedClubs', 'joinedClubs.teacher'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redisService.setObject(cacheKey, user.joinedClubs, 300);
    return user.joinedClubs;
  }
}
