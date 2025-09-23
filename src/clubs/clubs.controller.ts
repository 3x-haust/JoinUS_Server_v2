import {
  Controller,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApplyClubCommand } from './commands/apply-club.command';
import { CancelApplyClubCommand } from './commands/cancel-apply-club.command';
import { BookmarkClubCommand } from './commands/bookmark-club.command';
import { GetClubDetailQuery } from './queries/get-club-detail.query';
import { GetClubListQuery } from './queries/get-club-list.query';
import { GetBookmarkedClubsQuery } from './queries/get-bookmarked-clubs.query';
import { GetMyAppliedClubsQuery } from './queries/get-my-applied-clubs.query';
import { Club } from './entities/club.entity';
import { CreateClubCommand } from './commands/create-club.commmand';
import { CreateClubDto } from './dto/create-club.dto';
import { BookmarkClubDto } from './dto/bookmark-club.dto';
import { ClubsService } from './clubs.service';
import { TypedRoute, TypedBody, TypedParam, TypedQuery } from '@nestia/core';
import { tags } from 'typia';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

export interface ExtendedUser {
  id: number;
}

export interface RequestWithUser extends Request {
  user?: ExtendedUser;
  originalUrl: string;
  cookies: { [key: string]: string };
}

export interface ClubListQuery {
  page?: number & tags.Type<'int32'> & tags.Minimum<1>;
  limit?: number & tags.Type<'int32'> & tags.Minimum<1> & tags.Maximum<100>;
  search?: string;
}

export interface SuccessResponse {
  success: boolean;
}

@Controller('clubs')
export class ClubsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly clubsService: ClubsService,
  ) {}

  /**
   * 동아리 가입 신청
   *
   * @tag clubs
   * @summary 동아리 가입 신청
   * @param clubId 동아리 ID
   * @returns 가입 신청된 동아리 정보
   */
  @TypedRoute.Post(':clubId/apply')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  async applyClub(
    @TypedParam('clubId') clubId: number & tags.Type<'int32'> & tags.Minimum<1>,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponse> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    await this.commandBus.execute<ApplyClubCommand, void>(
      new ApplyClubCommand(clubId, userId),
    );
    return { success: true };
  }

  /**
   * 동아리 신청 취소
   *
   * @tag clubs
   * @summary 동아리 신청 취소
   * @param clubId 동아리 ID
   * @returns 취소 결과
   */
  @TypedRoute.Delete(':clubId/apply')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  async cancelApplyClub(
    @TypedParam('clubId') clubId: number & tags.Type<'int32'> & tags.Minimum<1>,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponse> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    const result = await this.commandBus.execute<
      CancelApplyClubCommand,
      SuccessResponse
    >(new CancelApplyClubCommand(clubId, userId));
    return result;
  }

  /**
   * 동아리 목록 조회
   *
   * @tag clubs
   * @summary 동아리 목록 조회
   * @returns 동아리 목록
   */
  @TypedRoute.Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async getClubList(@TypedQuery() query: ClubListQuery = {}): Promise<Club[]> {
    return await this.queryBus.execute<GetClubListQuery, Club[]>(
      new GetClubListQuery(query.page, query.limit, query.search),
    );
  }

  /**
   * 동아리 상세 정보 조회
   *
   * @tag clubs
   * @summary 동아리 상세 정보 조회
   * @param clubId 동아리 ID
   * @returns 동아리 상세 정보
   */
  @TypedRoute.Get(':clubId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN)
  async getClubDetail(
    @TypedParam('clubId') clubId: number & tags.Type<'int32'> & tags.Minimum<1>,
    @Req() req: RequestWithUser,
  ): Promise<Club> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    const clubDetail = await this.queryBus.execute<GetClubDetailQuery, Club>(
      new GetClubDetailQuery(clubId, userId),
    );
    return clubDetail;
  }

  /**
   * 동아리 생성
   *
   * @tag clubs
   * @summary 새로운 동아리 생성
   * @param dto 동아리 생성 정보
   * @returns 생성된 동아리 정보
   */
  @TypedRoute.Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async createClub(
    @TypedBody() dto: CreateClubDto,
    @Req() req: RequestWithUser,
  ): Promise<Club> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    const club = await this.commandBus.execute<CreateClubCommand, Club>(
      new CreateClubCommand(
        userId,
        dto.name,
        dto.description,
        dto.capacity,
        dto.url,
        dto.preview,
      ),
    );
    return club;
  }

  /**
   * 동아리 북마크 토글
   *
   * @tag clubs
   * @summary 동아리 북마크 추가/제거
   * @param dto 북마크할 동아리 정보
   * @returns 북마크 처리 결과
   */
  @TypedRoute.Post('bookmark')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  async bookmarkClub(
    @TypedBody() dto: BookmarkClubDto,
    @Req() req: RequestWithUser,
  ): Promise<SuccessResponse> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    const result = await this.commandBus.execute<
      BookmarkClubCommand,
      SuccessResponse
    >(new BookmarkClubCommand(userId, dto.clubId));
    return result;
  }

  /**
   * 내가 북마크한 동아리 목록 조회
   *
   * @tag clubs
   * @summary 북마크한 동아리 목록 조회
   * @returns 북마크한 동아리 목록
   */
  @TypedRoute.Get('me/bookmarked')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  async getBookmarkedClubs(@Req() req: RequestWithUser): Promise<Club[]> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    const bookmarkedClubs = await this.queryBus.execute<
      GetBookmarkedClubsQuery,
      Club[]
    >(new GetBookmarkedClubsQuery(userId));
    return bookmarkedClubs;
  }

  /**
   * 내가 신청한 동아리 목록 조회
   *
   * @tag clubs
   * @summary 내가 신청한 동아리 목록 조회
   * @returns 내가 신청한 동아리 목록
   */
  @TypedRoute.Get('me/applied')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.STUDENT)
  async getMyAppliedClubs(@Req() req: RequestWithUser): Promise<Club[]> {
    if (!req.user) {
      throw new UnauthorizedException(
        '사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.',
      );
    }
    const userId = req.user.id;
    const appliedClubs = await this.queryBus.execute<
      GetMyAppliedClubsQuery,
      Club[]
    >(new GetMyAppliedClubsQuery(userId));
    return appliedClubs;
  }
}
