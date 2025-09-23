import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OpenClubRegistrationCommand } from '../commands/open-club-registration.command';
import { RedisService } from '../../infra/redis/redis.service';

@CommandHandler(OpenClubRegistrationCommand)
export class OpenClubRegistrationHandler
  implements ICommandHandler<OpenClubRegistrationCommand>
{
  constructor(private readonly redisService: RedisService) {}

  async execute(
    command: OpenClubRegistrationCommand,
  ): Promise<{ success: boolean }> {
    const { startDate, endDate } = command;

    await this.redisService.set(
      'club_registration_start',
      startDate.toISOString(),
    );
    await this.redisService.set('club_registration_end', endDate.toISOString());
    await this.redisService.set('club_registration_status', 'open');

    return { success: true };
  }
}
