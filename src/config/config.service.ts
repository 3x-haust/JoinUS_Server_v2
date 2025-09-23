import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get port(): number {
    return Number(this.config.get<number>('PORT_NESTJS', 3000));
  }

  get prometheusPort(): number {
    return Number(this.config.get<number>('PORT_PROMETHEUS', 9090));
  }

  get grafanaPort(): number {
    return Number(this.config.get<number>('PORT_GRAFANA', 3001));
  }

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get grafanaAdminPassword(): string {
    return this.config.get<string>('GRAFANA_ADMIN_PASSWORD', 'admin');
  }

  get databaseHost(): string {
    return this.config.get<string>('DATABASE_HOST', 'localhost');
  }

  get databasePort(): number {
    return Number(this.config.get<number>('DATABASE_PORT', 5432));
  }

  get databaseUser(): string {
    return this.config.get<string>('DATABASE_USER', 'postgres');
  }

  get databasePassword(): string {
    return this.config.get<string>('DATABASE_PASSWORD', 'postgres');
  }

  get databaseName(): string {
    return this.config.get<string>('DATABASE_NAME', 'joinus');
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

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET', 'your_jwt_secret_here');
  }

  get adminEmail(): string | undefined {
    return this.config.get<string>('ADMIN_EMAIL');
  }

  get adminName(): string | undefined {
    return this.config.get<string>('ADMIN_NAME');
  }

  get adminRole(): string | undefined {
    return this.config.get<string>('ADMIN_ROLE');
  }

  get adminGrade(): number | undefined {
    const g = this.config.get<string>('ADMIN_GRADE');
    return g !== undefined && g !== null ? Number(g) : undefined;
  }

  get firebaseProjectId(): string | undefined {
    return this.config.get<string>('FIREBASE_PROJECT_ID');
  }

  get firebaseClientEmail(): string | undefined {
    return this.config.get<string>('FIREBASE_CLIENT_EMAIL');
  }

  get firebasePrivateKey(): string | undefined {
    const key = this.config.get<string>('FIREBASE_PRIVATE_KEY');
    return key ? key.replace(/\\n/g, '\n') : undefined;
  }

  get cookieDomain(): string | undefined {
    return this.config.get<string>('COOKIE_DOMAIN');
  }
}
