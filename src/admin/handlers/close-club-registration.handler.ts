import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseClubRegistrationCommand } from '../commands/close-club-registration.command';
import { RedisService } from '../../infra/redis/redis.service';

@CommandHandler(CloseClubRegistrationCommand)
export class CloseClubRegistrationHandler
  implements ICommandHandler<CloseClubRegistrationCommand>
{
  constructor(private readonly redisService: RedisService) {}

  async execute(
    command: CloseClubRegistrationCommand,
  ): Promise<{ success: boolean }> {
    const { reason } = command;

    await this.redisService.set('club_registration_status', 'closed');
    if (reason) {
      await this.redisService.set('club_registration_close_reason', reason);
    }

    return { success: true };
  }
}
