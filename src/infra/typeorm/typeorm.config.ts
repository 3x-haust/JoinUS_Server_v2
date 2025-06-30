import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '../../config/config.service';
import { Club } from '../../clubs/entities/club.entity';
import { User } from '../../users/entities/user.entity';
// import { Log } from '../../logs/entities/log.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.databaseHost,
  port: configService.databasePort,
  username: configService.databaseUser,
  password: configService.databasePassword,
  database: configService.databaseName,
  entities: [Club, User],
  synchronize: false,
  migrationsRun: true,
  logging: false,
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
});
