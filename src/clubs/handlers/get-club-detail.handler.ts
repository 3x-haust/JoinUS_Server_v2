import { IQueryHandler, QueryHandler, CommandBus } from '@nestjs/cqrs';
import { GetClubDetailQuery } from '../queries/get-club-detail.query';
import { ClubsService } from '../clubs.service';
import { Club } from '../entities/club.entity';
import { CreateLogCommand } from '../../logs/commands/create-log.command';
import { LogAction, LogTargetType } from '../../logs/entities/log.entity';

@QueryHandler(GetClubDetailQuery)
export class GetClubDetailHandler implements IQueryHandler<GetClubDetailQuery> {
  constructor(
    private readonly clubsService: ClubsService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(query: GetClubDetailQuery): Promise<Club> {
    const club = await this.clubsService.getClubDetail(query.clubId);

    if (query.userId) {
      await this.commandBus.execute(
        new CreateLogCommand(
          query.userId,
          LogAction.VIEW_CLUB_DETAIL,
          LogTargetType.CLUB,
          club.id,
          `동아리 "${club.name}" 상세 조회`,
        ),
      );
    }

    return club;
  }
}
