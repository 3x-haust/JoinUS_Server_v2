import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class ResponseInterceptor<T = any> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (request.url.includes('/metrics')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: T) => ({
        statusCode: response.statusCode,
        message: '요청이 성공적으로 처리되었습니다.',
        data: data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
