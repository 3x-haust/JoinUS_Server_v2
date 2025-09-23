import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request): string | null => {
          const cookies = (
            req as unknown as { cookies?: Record<string, unknown> }
          ).cookies;
          const v = cookies?.['access_token'];
          return typeof v === 'string' ? v : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(payload: {
    id: number;
    scopes?: string[];
    clientId?: string;
  }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    if (!user) throw new UnauthorizedException('사용자를 찾을 수 없습니다.');

    if (payload.scopes) {
      user['scopes'] = payload.scopes;
    }

    return user;
  }
}
