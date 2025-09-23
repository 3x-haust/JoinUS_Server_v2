import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kafka, Consumer } from 'kafkajs';
import { ConfigService } from '../../config/config.service';
import { Log, LogAction, LogTargetType } from '../entities/log.entity';
import { RedisService } from '../../infra/redis/redis.service';

interface LogMessage {
  userId: number;
  action: LogAction;
  targetType: LogTargetType;
  targetId?: number;
  description?: string;
  createdAt: Date;
}

@Injectable()
export class LogKafkaConsumerService implements OnModuleInit {
  private consumer: Consumer;

  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const kafka = new Kafka({ brokers: this.configService.kafkaBrokers });
    this.consumer = kafka.consumer({ groupId: 'logs-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'logs' });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const logData = JSON.parse(
            message.value?.toString() || '{}',
          ) as LogMessage;
          await this.saveLog(logData);
          await this.invalidateCache(logData);
        } catch (error) {
          console.error('Error processing log message:', error);
        }
      },
    });
  }

  private async saveLog(logData: LogMessage): Promise<void> {
    const log = this.logRepository.create({
      userId: logData.userId,
      action: logData.action,
      targetType: logData.targetType,
      targetId: logData.targetId,
      description: logData.description,
      createdAt: logData.createdAt || new Date(),
    });

    await this.logRepository.save(log);
  }

  private async invalidateCache(logData: LogMessage): Promise<void> {
    const patterns = [
      'logs:all',
      'logs:recent:*',
      `logs:user:${logData.userId}*`,
      `logs:action:${logData.action}*`,
      `logs:club:${logData.targetId}*`,
    ];

    for (const pattern of patterns) {
      await this.redisService.delPattern(pattern);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
