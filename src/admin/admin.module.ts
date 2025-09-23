import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Club } from '../clubs/entities/club.entity';
import { Log } from '../logs/entities/log.entity';
import { OpenClubRegistrationHandler } from './handlers/open-club-registration.handler';
import { CloseClubRegistrationHandler } from './handlers/close-club-registration.handler';
import { RedisModule } from '../infra/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Club, Log]), RedisModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    OpenClubRegistrationHandler,
    CloseClubRegistrationHandler,
  ],
  exports: [AdminService],
})
export class AdminModule {}
