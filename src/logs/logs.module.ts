import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { Log } from './entities/log.entity';
import { User } from '../users/entities/user.entity';
import {
  GetLogsByUserHandler,
  GetLogsByClubHandler,
  GetLogsByActionHandler,
  GetAllLogsHandler,
} from './handlers/get-logs.handler';
import { CreateLogHandler } from './handlers/create-log.handler';
import { LogKafkaConsumerService } from './services/log-kafka-consumer.service';
import { RedisModule } from 'src/infra/redis/redis.module';
import { KafkaModule } from 'src/infra/kafka/kafka.module';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log, User]),
    CqrsModule,
    ConfigModule,
    RedisModule,
    KafkaModule,
    AuthModule,
  ],
  controllers: [LogsController],
  providers: [
    LogsService,
    GetLogsByUserHandler,
    GetLogsByClubHandler,
    GetLogsByActionHandler,
    GetAllLogsHandler,
    CreateLogHandler,
    LogKafkaConsumerService,
  ],
  exports: [LogsService],
})
export class LogsModule {}
