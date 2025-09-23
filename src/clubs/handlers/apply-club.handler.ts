import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplyClubCommand } from '../commands/apply-club.command';
import {
  ClubApplicationQueueService,
  ClubApplicationEvent,
} from '../services/club-application-queue.service';

@CommandHandler(ApplyClubCommand)
export class ApplyClubHandler implements ICommandHandler<ApplyClubCommand> {
  constructor(private readonly queueService: ClubApplicationQueueService) {}

  async execute(command: ApplyClubCommand): Promise<void> {
    const event: ClubApplicationEvent = {
      userId: command.userId,
      clubId: command.clubId,
      timestamp: Date.now(),
      requestId: `${command.clubId}-${command.userId}-${Date.now()}`,
    };

    await this.queueService.enqueueApplication(event);
  }
}
