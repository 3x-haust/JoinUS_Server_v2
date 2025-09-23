import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLogCommand } from '../commands/create-log.command';
import { KafkaService } from '../../infra/kafka/kafka.service';

@CommandHandler(CreateLogCommand)
export class CreateLogHandler implements ICommandHandler<CreateLogCommand> {
  constructor(private readonly kafkaService: KafkaService) {}

  async execute(command: CreateLogCommand): Promise<void> {
    await this.kafkaService.send('logs', {
      value: JSON.stringify({
        userId: command.userId,
        action: command.action,
        targetType: command.targetType,
        targetId: command.targetId,
        description: command.description,
        createdAt: new Date(),
      }),
    });
  }
}
