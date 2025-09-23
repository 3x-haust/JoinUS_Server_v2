import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ClubsModule } from './clubs/clubs.module';
import { UsersModule } from './users/users.module';
import { LogsModule } from './logs/logs.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config/config.service';
import { typeOrmConfig } from './infra/typeorm/typeorm.config';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { MetricsInterceptor } from './shared/interceptors/metrics.interceptor';
import { HttpExceptionFilter } from './shared/exceptions/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { PrometheusModule as CustomPrometheusModule } from './infra/prometheus/prometheus.module';
import { HealthController } from './shared/controllers/health.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    CustomPrometheusModule,
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    ClubsModule,
    UsersModule,
    LogsModule,
    AdminModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
