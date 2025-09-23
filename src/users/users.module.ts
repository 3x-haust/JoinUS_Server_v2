import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Log } from '../logs/entities/log.entity';
import { CreateUserHandler } from './handlers/create-user.handler';
import { GetUserDetailHandler } from './handlers/get-user-detail.handler';
import { GetMyPageHandler } from './handlers/get-my-page.handler';
import { RedisModule } from 'src/infra/redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { AdminProvisionerService } from './services/admin-provisioner.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Log]), RedisModule, AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserHandler,
    GetUserDetailHandler,
    GetMyPageHandler,
    AdminProvisionerService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
