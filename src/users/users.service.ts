import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RedisService } from '../infra/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;

    const cached = await this.redisService.getObject<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      await this.redisService.setObject(cacheKey, user, 600);
    }

    return user;
  }

  async findById(id: number): Promise<User | null> {
    const cacheKey = `user:id:${id}`;

    const cached = await this.redisService.getObject<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (user) {
      await this.redisService.setObject(cacheKey, user, 600);
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    const cacheKey = 'users:all';

    const cached = await this.redisService.getObject<User[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const users = await this.userRepository.find({
      relations: ['teachingClubs', 'joinedClubs', 'bookmarkedClubs'],
    });

    await this.redisService.setObject(cacheKey, users, 300);

    return users;
  }
}
