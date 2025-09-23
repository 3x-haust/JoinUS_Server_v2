import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { ClubSchedulerService } from './club-scheduler.service';
import { Club } from './entities/club.entity';
import { CreateClubHandler } from './handlers/create-club.handler';
import { GetClubDetailHandler } from './handlers/get-club-detail.handler';
import { GetClubListHandler } from './handlers/get-club-list.handler';
import { ApplyClubHandler } from './handlers/apply-club.handler';
import { CancelApplyClubHandler } from './handlers/cancel-apply-club.handler';
import { BookmarkClubHandler } from './handlers/bookmark-club.handler';
import { GetBookmarkedClubsHandler } from './handlers/get-bookmarked-clubs.handler';
import { GetMyAppliedClubsHandler } from './handlers/get-my-applied-clubs.handler';
import { User } from '../users/entities/user.entity';
import { RedisModule } from '../infra/redis/redis.module';
import { LogsModule } from '../logs/logs.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '../config/config.module';
import { KafkaModule } from '../infra/kafka/kafka.module';
import { ClubApplicationQueueService } from './services/club-application-queue.service';
import { ClubApplicationConsumer } from './consumers/club-application.consumer';
import { ClubApplicationProcessor } from './processors/club-application.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Club, User]),
    RedisModule,
    LogsModule,
    ScheduleModule.forRoot(),
    AuthModule,
    KafkaModule,
    ConfigModule,
  ],
  controllers: [ClubsController],
  providers: [
    ClubsService,
    ClubSchedulerService,
    CreateClubHandler,
    GetClubDetailHandler,
    GetClubListHandler,
    ApplyClubHandler,
    CancelApplyClubHandler,
    BookmarkClubHandler,
    GetBookmarkedClubsHandler,
    GetMyAppliedClubsHandler,
    ClubApplicationQueueService,
    ClubApplicationConsumer,
    ClubApplicationProcessor,
  ],
})
export class ClubsModule {}
