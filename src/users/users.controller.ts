import {
  Controller,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './commands/create-user.command';
import { GetUserDetailQuery } from './queries/get-user-detail.query';
import { GetMyPageQuery } from './queries/get-my-page.query';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import { tags } from 'typia';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from './entities/user.entity';

export interface ExtendedUser {
  id: number;
}

export interface RequestWithUser extends Request {
  user?: ExtendedUser;
  originalUrl: string;
  cookies: { [key: string]: string };
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * 새로운 사용자 생성
   *
   * @tag users
   * @summary 새로운 사용자 생성
   * @param dto 사용자 생성 정보
   * @returns 생성된 사용자 정보
   */
  @TypedRoute.Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@TypedBody() dto: CreateUserDto): Promise<User> {
    const user = await this.commandBus.execute<CreateUserCommand, User>(
      new CreateUserCommand(dto.email, dto.name, dto.role, dto.grade),
    );
    return user;
  }

  /**
   * 사용자 상세 정보 조회
   *
   * @tag users
   * @summary 특정 사용자의 상세 정보 조회
   * @param userId 사용자 ID
   * @returns 사용자 상세 정보
   */
  @TypedRoute.Get(':userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async getUserDetail(
    @TypedParam('userId') userId: number & tags.Type<'int32'> & tags.Minimum<1>,
  ): Promise<User> {
    const user = await this.queryBus.execute<GetUserDetailQuery, User>(
      new GetUserDetailQuery(userId),
    );
    return user;
  }

  /**
   * 내 정보 조회
   *
   * @tag users
   * @summary 로그인한 사용자의 마이페이지 정보 조회
   * @returns 내 정보
   */
  @TypedRoute.Get('me')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  async getMyPage(@Req() req: RequestWithUser): Promise<User> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    const user = await this.queryBus.execute<GetMyPageQuery, User>(
      new GetMyPageQuery(userId),
    );
    return user;
  }
}
