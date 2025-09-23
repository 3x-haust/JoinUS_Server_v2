import { ICommand } from '@nestjs/cqrs';

export abstract class BaseCommandHandler<
  TCommand extends ICommand,
  TResult = any,
> {
  abstract execute(command: TCommand): Promise<TResult>;
}
