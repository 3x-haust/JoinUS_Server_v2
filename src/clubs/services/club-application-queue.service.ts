import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { KafkaService } from '../../infra/kafka/kafka.service';
import { RedisService } from '../../infra/redis/redis.service';
import { LogsService } from '../../logs/logs.service';
import { Club } from '../entities/club.entity';
import { User } from '../../users/entities/user.entity';
import { LogAction, LogTargetType } from '../../logs/entities/log.entity';

export interface ClubApplicationEvent {
  userId: number;
  clubId: number;
  timestamp: number;
  requestId: string;
}

@Injectable()
export class ClubApplicationQueueService {
  private readonly TOPIC = 'club-applications';
  private readonly RETRY_TOPIC = 'club-applications-retry';
  private readonly DLQ_TOPIC = 'club-applications-dlq';

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
    private readonly logsService: LogsService,
  ) {}

  async enqueueApplication(event: ClubApplicationEvent): Promise<void> {
    try {
      await this.kafkaService.send(this.TOPIC, {
        key: `${event.clubId}-${event.userId}`,
        value: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'request-id': event.requestId,
          'retry-count': '0',
        },
      });
    } catch (error) {
      console.error('Failed to enqueue club application:', error);
      throw error;
    }
  }

  async processApplication(event: ClubApplicationEvent): Promise<void> {
    const { userId, clubId } = event;

    const lockKey = `club:apply:lock:${clubId}`;
    const lockValue = `${userId}-${Date.now()}`;
    const lockTTL = 10;

    const lockAcquired = await this.redisService.setNX(
      lockKey,
      lockValue,
      lockTTL,
    );

    if (!lockAcquired) {
      throw new Error('동아리 신청이 진행 중입니다.');
    }

    try {
      await this.executeClubApplication(clubId, userId);
    } finally {
      await this.releaseLock(lockKey, lockValue);
    }
  }

  private async executeClubApplication(
    clubId: number,
    userId: number,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const club = await queryRunner.manager
        .createQueryBuilder(Club, 'club')
        .where('club.id = :clubId', { clubId })
        .setLock('pessimistic_write')
        .getOne();

      if (!club) {
        throw new Error('존재하지 않는 동아리입니다.');
      }

      if (!club.isApplicationOpen) {
        throw new Error('동아리 신청이 마감되었습니다.');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new Error('존재하지 않는 사용자입니다.');
      }

      const existingApplication = club.applicants?.find(
        (applicant) => applicant.id === userId,
      );

      if (existingApplication) {
        throw new Error('이미 신청한 동아리입니다.');
      }

      if (club.currentApplicantCount >= club.capacity[0]) {
        throw new Error('동아리 정원이 초과되었습니다.');
      }

      club.applicants = [...(club.applicants || []), user];
      club.currentApplicantCount = (club.currentApplicantCount || 0) + 1;

      await queryRunner.manager.save(club);

      await this.logsService.createLog(
        userId,
        LogAction.APPLY,
        LogTargetType.CLUB,
        clubId,
        `동아리 신청: ${club.name}`,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async releaseLock(lockKey: string, lockValue: string): Promise<void> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.redisService.eval(script, 1, lockKey, lockValue);
  }

  async handleRetry(
    event: ClubApplicationEvent,
    retryCount: number,
  ): Promise<void> {
    if (retryCount >= 3) {
      await this.kafkaService.send(this.DLQ_TOPIC, {
        key: `${event.clubId}-${event.userId}`,
        value: JSON.stringify({
          ...event,
          failedAt: Date.now(),
          reason: 'Max retries exceeded',
        }),
      });
      return;
    }

    const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
    setTimeout(() => {
      void this.kafkaService.send(this.RETRY_TOPIC, {
        key: `${event.clubId}-${event.userId}`,
        value: JSON.stringify(event),
        headers: {
          'retry-count': (retryCount + 1).toString(),
        },
      });
    }, delayMs);
  }
}
