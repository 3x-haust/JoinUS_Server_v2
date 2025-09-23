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
import { LogsService } from '../../logs/logs.service';
import { LogAction, LogTargetType } from '../../logs/entities/log.entity';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, originalUrl } = req;
    const now = Date.now();
    const userId = req.user?.id;
    const request = context.switchToHttp().getRequest<Request>();

    if (request.url.includes('/metrics')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const { statusCode } = res;
          const delay = Date.now() - now;
          this.logger.log(`${method} ${originalUrl} ${statusCode} +${delay}ms`);

          if (userId) {
            void this.logsService.createLog(
              userId,
              this.getLogAction(method, originalUrl),
              LogTargetType.PAGE,
              undefined,
              `${method} ${originalUrl} - ${statusCode} (${delay}ms)`,
            );
          }
        },
        error: (err) => {
          const delay = Date.now() - now;
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `${method} ${originalUrl} FAILED +${delay}ms | ${errorMessage}`,
          );

          if (userId) {
            void this.logsService.createLog(
              userId,
              this.getLogAction(method, originalUrl),
              LogTargetType.PAGE,
              undefined,
              `ERROR: ${method} ${originalUrl} - ${errorMessage} (${delay}ms)`,
            );
          }
        },
      }),
    );
  }

  private getLogAction(method: string, url: string): LogAction {
    if (url.includes('/clubs') && method === 'GET') {
      if (url.includes('/detail')) return LogAction.VIEW_CLUB_DETAIL;
      return LogAction.VIEW_CLUB_LIST;
    }
    if (url.includes('/users/me')) return LogAction.VIEW_MY_PAGE;
    if (url.includes('/auth/login')) return LogAction.LOGIN;
    if (url.includes('/auth/logout')) return LogAction.LOGOUT;
    if (url.includes('/clubs') && method === 'POST')
      return LogAction.CREATE_CLUB;
    if (url.includes('/clubs') && method === 'PUT')
      return LogAction.UPDATE_CLUB;
    if (url.includes('/clubs') && method === 'DELETE')
      return LogAction.DELETE_CLUB;

    return LogAction.VIEW_CLUB_LIST;
  }
}
