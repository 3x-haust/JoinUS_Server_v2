import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CancelApplyClubCommand } from '../commands/cancel-apply-club.command';
import { Club } from '../entities/club.entity';
import { User } from '../../users/entities/user.entity';
import { LogAction, LogTargetType } from '../../logs/entities/log.entity';
import { LogsService } from '../../logs/logs.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@CommandHandler(CancelApplyClubCommand)
export class CancelApplyClubHandler
  implements ICommandHandler<CancelApplyClubCommand>
{
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logsService: LogsService,
  ) {}

  async execute(
    command: CancelApplyClubCommand,
  ): Promise<{ success: boolean }> {
    const { clubId, userId } = command;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['joinedClubs'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const club = await this.clubRepository.findOne({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    const isApplied = user.joinedClubs.some(
      (joinedClub) => joinedClub.id === clubId,
    );

    if (!isApplied) {
      throw new BadRequestException('User has not applied to this club');
    }

    user.joinedClubs = user.joinedClubs.filter(
      (joinedClub) => joinedClub.id !== clubId,
    );

    await this.userRepository.save(user);

    await this.logsService.createLog(
      userId,
      LogAction.CANCEL_APPLY,
      LogTargetType.CLUB,
      clubId,
      `동아리 '${club.name}' 신청을 취소했습니다.`,
    );

    return { success: true };
  }
}
