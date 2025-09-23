import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any): any {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException('TOKEN_EXPIRED');
      } else if (info) {
        throw new UnauthorizedException('INVALID_TOKEN');
      }
      throw new UnauthorizedException();
    }
    return user;
  }
}
