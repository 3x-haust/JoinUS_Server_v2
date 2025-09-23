import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { User } from '../users/entities/user.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { RedisService } from '../infra/redis/redis.service';

@Injectable()
export class ClubsService {
  private readonly CACHE_TTL = 300;
  private readonly CLUB_CACHE_PREFIX = 'club:detail:';
  private readonly CLUB_LIST_CACHE_KEY = 'clubs:list';

  constructor(
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
    private readonly redisService: RedisService,
  ) {}

  async applyClub(clubId: number, userId: number): Promise<void> {
    const club = await this.clubRepo.findOne({ where: { id: clubId } });

    if (!club) throw new NotFoundException('Club not found');

    const now = new Date();
    if (now > club.endDate || !club.isApplicationOpen) {
      throw new BadRequestException('Club application is closed');
    }

    club.applicants = [...(club.applicants || []), { id: userId } as User];
    await this.clubRepo.save(club);

    await this.invalidateClubCache(clubId);
  }

  async getClubDetail(clubId: number): Promise<Club> {
    const cacheKey = `${this.CLUB_CACHE_PREFIX}${clubId}`;

    const cachedClub = await this.redisService.getObject<Club>(cacheKey);
    if (cachedClub) {
      return cachedClub;
    }

    const club = await this.clubRepo.findOne({
      where: { id: clubId },
      relations: ['teacher', 'applicants', 'bookmarkedBy'],
    });

    if (!club) throw new NotFoundException('Club not found');

    await this.redisService.setObject(cacheKey, club, this.CACHE_TTL);

    return club;
  }

  async createClub(dto: CreateClubDto): Promise<void> {
    const club = this.clubRepo.create(dto);
    await this.clubRepo.save(club);

    await this.redisService.del(this.CLUB_LIST_CACHE_KEY);
  }

  async getClubList(): Promise<Club[]> {
    const cachedList = await this.redisService.getObject<Club[]>(
      this.CLUB_LIST_CACHE_KEY,
    );
    if (cachedList) {
      return cachedList;
    }

    const clubs = await this.clubRepo.find({
      relations: ['teacher'],
      order: { id: 'DESC' },
    });

    await this.redisService.setObject(
      this.CLUB_LIST_CACHE_KEY,
      clubs,
      this.CACHE_TTL,
    );

    return clubs;
  }

  private async invalidateClubCache(clubId: number): Promise<void> {
    const cacheKey = `${this.CLUB_CACHE_PREFIX}${clubId}`;
    await this.redisService.del(cacheKey);
    await this.redisService.del(this.CLUB_LIST_CACHE_KEY);
  }
}
