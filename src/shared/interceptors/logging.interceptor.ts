import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = req;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const { statusCode } = res;
          const delay = Date.now() - now;
          this.logger.log(`${method} ${originalUrl} ${statusCode} +${delay}ms`);
        },
        error: (err) => {
          const delay = Date.now() - now;
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `${method} ${originalUrl} FAILED +${delay}ms | ${errorMessage}`,
          );
        },
      }),
    );
  }
}
