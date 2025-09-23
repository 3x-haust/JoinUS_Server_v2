import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Club } from './entities/club.entity';
import { LogsService } from '../logs/logs.service';
import { LogAction, LogTargetType } from '../logs/entities/log.entity';

@Injectable()
export class ClubSchedulerService {
  constructor(
    @InjectRepository(Club)
    private readonly clubRepo: Repository<Club>,
    private readonly logsService: LogsService,
  ) {}

  @Cron('0 0 * * *')
  async checkExpiredClubs(): Promise<void> {
    const now = new Date();

    const expiredClubs = await this.clubRepo.find({
      where: {
        endDate: LessThanOrEqual(now),
        isApplicationOpen: true,
      },
    });

    for (const club of expiredClubs) {
      club.isApplicationOpen = false;
      await this.clubRepo.save(club);

      await this.logsService.createLog(
        0,
        LogAction.AUTO_CLOSE_CLUB,
        LogTargetType.CLUB,
        club.id,
        `동아리 ${club.name} (ID: ${club.id}) 신청이 자동으로 마감되었습니다`,
      );
    }
  }

  @Cron('0 * * * *')
  async checkExpiredClubsHourly(): Promise<void> {
    await this.checkExpiredClubs();
  }
}
