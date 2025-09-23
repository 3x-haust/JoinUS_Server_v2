import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Club } from '../clubs/entities/club.entity';
import { Log } from '../logs/entities/log.entity';
import { RedisService } from '../infra/redis/redis.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly redisService: RedisService,
  ) {}

  async getAllUsers(): Promise<User[]> {
    const cacheKey = 'admin:users:all';

    const cached = await this.redisService.getObject<User[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const users = await this.userRepository.find({
      relations: ['teachingClubs', 'joinedClubs'],
      order: { id: 'ASC' },
    });

    await this.redisService.setObject(cacheKey, users, 300);

    return users;
  }

  async getTeachers(): Promise<User[]> {
    const cacheKey = 'admin:teachers:all';

    const cached = await this.redisService.getObject<User[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const teachers = await this.userRepository.find({
      where: { role: UserRole.TEACHER },
      relations: ['teachingClubs'],
      order: { id: 'ASC' },
    });

    await this.redisService.setObject(cacheKey, teachers, 600);

    return teachers;
  }

  async getStudents(): Promise<User[]> {
    const cacheKey = 'admin:students:all';

    const cached = await this.redisService.getObject<User[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const students = await this.userRepository.find({
      where: { role: UserRole.STUDENT },
      relations: ['joinedClubs', 'bookmarkedClubs'],
      order: { grade: 'ASC', id: 'ASC' },
    });

    await this.redisService.setObject(cacheKey, students, 300);

    return students;
  }

  async getAllClubs(): Promise<Club[]> {
    const cacheKey = 'admin:clubs:all';

    const cached = await this.redisService.getObject<Club[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const clubs = await this.clubRepository.find({
      relations: ['teacher', 'applicants', 'bookmarkedBy'],
      order: { id: 'ASC' },
    });

    await this.redisService.setObject(cacheKey, clubs, 300);

    return clubs;
  }

  async getAllLogs(): Promise<Log[]> {
    const cacheKey = 'admin:logs:all';

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

  async createTeacher(email: string, name: string): Promise<User> {
    const user = this.userRepository.create({
      email,
      name,
      role: UserRole.TEACHER,
      grade: 0,
    });
    const savedUser = await this.userRepository.save(user);

    await this.invalidateUserCaches();

    return savedUser;
  }

  async createStudent(
    email: string,
    name: string,
    grade: number,
  ): Promise<User> {
    const user = this.userRepository.create({
      email,
      name,
      role: UserRole.STUDENT,
      grade,
    });
    const savedUser = await this.userRepository.save(user);

    await this.invalidateUserCaches();

    return savedUser;
  }

  private async invalidateUserCaches(): Promise<void> {
    await this.redisService.del('admin:users:all');
    await this.redisService.del('admin:teachers:all');
    await this.redisService.del('admin:students:all');
    await this.redisService.del('users:all');
  }
}
