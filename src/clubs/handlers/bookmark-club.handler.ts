import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkClubCommand } from '../commands/bookmark-club.command';
import { Club } from '../entities/club.entity';
import { User } from '../../users/entities/user.entity';
import { LogAction, LogTargetType } from '../../logs/entities/log.entity';
import { RedisService } from '../../infra/redis/redis.service';
import { LogsService } from '../../logs/logs.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(BookmarkClubCommand)
export class BookmarkClubHandler
  implements ICommandHandler<BookmarkClubCommand>
{
  constructor(
    @InjectRepository(Club)
    private readonly clubRepository: Repository<Club>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logsService: LogsService,
    private readonly redisService: RedisService,
  ) {}

  async execute(command: BookmarkClubCommand): Promise<{ success: boolean }> {
    const { userId, clubId } = command;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarkedClubs'],
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

    const isAlreadyBookmarked = user.bookmarkedClubs.some(
      (bookmarkedClub) => bookmarkedClub.id === clubId,
    );

    let logAction: LogAction;
    let logDescription: string;

    if (isAlreadyBookmarked) {
      user.bookmarkedClubs = user.bookmarkedClubs.filter(
        (bookmarkedClub) => bookmarkedClub.id !== clubId,
      );
      logAction = LogAction.UNBOOKMARK;
      logDescription = `동아리 '${club.name}' 북마크를 해제했습니다.`;
    } else {
      user.bookmarkedClubs.push(club);
      logAction = LogAction.BOOKMARK;
      logDescription = `동아리 '${club.name}'을 북마크했습니다.`;
    }

    await this.userRepository.save(user);

    await this.logsService.createLog(
      userId,
      logAction,
      LogTargetType.CLUB,
      clubId,
      logDescription,
    );

    await this.invalidateUserCache(userId);
    await this.invalidateClubCache(clubId);

    return { success: true };
  }

  private async invalidateUserCache(userId: number): Promise<void> {
    await this.redisService.del(`user:${userId}:bookmarked-clubs`);
    await this.redisService.del(`user:detail:${userId}`);
    await this.redisService.del(`user:mypage:${userId}`);
  }

  private async invalidateClubCache(clubId: number): Promise<void> {
    await this.redisService.del(`club:detail:${clubId}`);
  }
}
