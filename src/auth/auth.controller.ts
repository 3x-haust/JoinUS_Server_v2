import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response, CookieOptions } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { ConfigService } from 'src/config/config.service';
import { LoginDto } from './dto/login.dto';
import * as admin from 'firebase-admin';
import { TypedRoute } from '@nestia/core';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebase: admin.app.App,
    private readonly jwtService: JwtService,
    private readonly appConfig: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /**
   * 구글 OAuth 로그인
   *
   * @tag auth
   * @summary 구글 OAuth 로그인
   * @param dto 로그인 정보 (idToken)
   * @param res 응답 객체 (쿠키 설정용)
   * @returns 로그인 성공 여부 및 토큰
   */
  @TypedRoute.Post('google')
  @HttpCode(200)
  async google(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!dto || !dto.idToken) throw new BadRequestException();
    const decoded: admin.auth.DecodedIdToken = await this.firebase
      .auth()
      .verifyIdToken(dto.idToken, true);
    const email = decoded.email || '';
    if (!email) {
      return { success: false };
    }
    let user = await this.users.findOne({ where: { email } });
    if (!user) {
      user = this.users.create({
        email,
        role: UserRole.STUDENT,
        name: (decoded.name as string | undefined) || email.split('@')[0],
        grade: 0,
        oauthProvider: 'google',
        oauthProviderId: decoded.uid,
      });
      await this.users.save(user);
    }
    const payload = { id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const cookieOpts: CookieOptions = {
      httpOnly: true,
      secure: this.appConfig.nodeEnv !== 'development',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    };
    if (this.appConfig.cookieDomain) {
      cookieOpts.domain = this.appConfig.cookieDomain;
    }
    res.cookie('access_token', accessToken, cookieOpts);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    return { success: true, token: accessToken };
  }
}
