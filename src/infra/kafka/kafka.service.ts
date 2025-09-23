import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Kafka, Producer, Admin } from 'kafkajs';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      brokers: this.configService.kafkaBrokers,
      clientId: 'joinus-server',
    });
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    try {
      await this.admin.connect();
      await this.createTopicsIfNotExists();
      await this.producer.connect();
      this.logger.log('Kafka service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka service', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.admin.disconnect();
  }

  private async createTopicsIfNotExists() {
    const topics = [
      'club-applications',
      'club-applications-retry',
      'club-applications-dlq',
    ];

    const existingTopics = await this.admin.listTopics();
    const topicsToCreate = topics.filter(
      (topic) => !existingTopics.includes(topic),
    );

    if (topicsToCreate.length > 0) {
      await this.admin.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        })),
      });
      this.logger.log(`Created topics: ${topicsToCreate.join(', ')}`);
    }
  }

  async send(
    topic: string,
    message: { key?: string; value: string; headers?: Record<string, string> },
  ) {
    await this.producer.send({
      topic,
      messages: [
        {
          key: message.key,
          value: message.value,
          headers: message.headers,
        },
      ],
    });
  }
}
