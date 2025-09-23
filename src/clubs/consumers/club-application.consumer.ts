import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ConfigService } from '../../config/config.service';
import {
  ClubApplicationQueueService,
  ClubApplicationEvent,
} from '../services/club-application-queue.service';

@Injectable()
export class ClubApplicationConsumer implements OnModuleInit {
  private readonly logger = new Logger(ClubApplicationConsumer.name);
  private consumer: Consumer;

  constructor(
    private readonly configService: ConfigService,
    private readonly queueService: ClubApplicationQueueService,
  ) {
    const kafka = new Kafka({
      brokers: this.configService.kafkaBrokers,
      clientId: 'joinus-server-consumer',
    });
    this.consumer = kafka.consumer({ groupId: 'club-application-group' });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'club-applications' });
      await this.consumer.subscribe({ topic: 'club-applications-retry' });

      await this.consumer.run({
        eachMessage: async ({ message }) => {
          const event = JSON.parse(
            message.value?.toString() || '{}',
          ) as ClubApplicationEvent;
          const retryCount = parseInt(
            message.headers?.['retry-count']?.toString() || '0',
            10,
          );

          try {
            await this.queueService.processApplication(event);
            this.logger.log(
              `Successfully processed application: ${event.requestId}`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to process application: ${event.requestId}`,
              error,
            );
            await this.queueService.handleRetry(event, retryCount);
          }
        },
      });

      this.logger.log('Club application consumer started successfully');
    } catch (error) {
      this.logger.error('Failed to start club application consumer', error);
    }
  }

  async onApplicationShutdown() {
    await this.consumer.disconnect();
  }
}
