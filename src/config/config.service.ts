import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get port(): number {
    return Number(this.config.get<number>('PORT', 3000));
  }

  get databaseHost(): string {
    return this.config.get<string>('DB_HOST', 'localhost');
  }

  get databasePort(): number {
    return Number(this.config.get<number>('DB_PORT', 5432));
  }

  get databaseUser(): string {
    return this.config.get<string>('DB_USER', 'postgres');
  }

  get databasePassword(): string {
    return this.config.get<string>('DB_PASSWORD', 'secret');
  }

  get databaseName(): string {
    return this.config.get<string>('DB_NAME', 'joinus');
  }

  get kafkaBrokers(): string[] {
    return this.config
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');
  }

  get redisHost(): string {
    return this.config.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return Number(this.config.get<number>('REDIS_PORT', 6379));
  }
}
