import { IQuery } from '@nestjs/cqrs';

export abstract class BaseQueryHandler<TQuery extends IQuery, TResult = any> {
  abstract execute(query: TQuery): Promise<TResult>;
}
