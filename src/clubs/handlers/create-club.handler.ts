import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateClubCommand } from '../commands/create-club.commmand';
import { Club } from '../entities/club.entity';
import { User } from '../../users/entities/user.entity';
import { RedisService } from '../../infra/redis/redis.service';
import { CreateLogCommand } from '../../logs/commands/create-log.command';
import { LogAction, LogTargetType } from '../../logs/entities/log.entity';

@CommandHandler(CreateClubCommand)
export class CreateClubHandler
  implements ICommandHandler<CreateClubCommand, Club>
{
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateClubCommand): Promise<Club> {
    const { teacherId, name, description, capacity, url, preview } = command;

    try {
      const teacher = await this.userRepository.findOneBy({ id: teacherId });
      if (!teacher) {
        throw new NotFoundException(
          `Teacher with ID "${teacherId}" not found.`,
        );
      }

      const club = this.clubRepository.create({
        teacher,
        name,
        description,
        capacity,
        url,
        preview,
      });

      const savedClub = await this.clubRepository.save(club);

      await this.commandBus.execute(
        new CreateLogCommand(
          teacherId,
          LogAction.CREATE_CLUB,
          LogTargetType.CLUB,
          savedClub.id,
          `동아리 "${savedClub.name}" 생성`,
        ),
      );

      await this.invalidateClubListCaches();

      return savedClub;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const dbError = error as { code: string };
        if (dbError.code === '23505') {
          throw new BadRequestException(
            `Club with name "${name}" already exists.`,
          );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the club.',
      );
    }
  }

  private async invalidateClubListCaches(): Promise<void> {
    await this.redisService.del('clubs:list');
    await this.redisService.del('admin:clubs:all');
  }
}
