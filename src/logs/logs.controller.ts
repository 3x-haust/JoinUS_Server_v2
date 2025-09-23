import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Log, LogAction } from './entities/log.entity';
import { GetAllLogsDto } from './dto/get-all-logs.dto';
import { PaginationDto } from './dto/pagination.dto';
import { TypedRoute, TypedParam, TypedQuery } from '@nestia/core';
import {
  GetLogsByUserQuery,
  GetLogsByClubQuery,
  GetLogsByActionQuery,
  GetAllLogsQuery,
} from './queries/get-logs.query';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('logs')
export class LogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * 특정 사용자의 로그를 조회합니다.
   *
   * @tag logs
   * @summary 사용자별 로그 조회
   * @param pagination 페이지네이션 정보
   * @returns 사용자의 로그 목록
   */
  @TypedRoute.Get('user/:userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getLogsByUser(
    @TypedParam('userId') userId: number,
    @TypedQuery() pagination: PaginationDto,
  ): Promise<Log[]> {
    const query = new GetLogsByUserQuery(
      userId,
      pagination.page || 1,
      pagination.limit || 50,
    );
    return this.queryBus.execute(query);
  }

  /**
   * 특정 동아리의 로그를 조회합니다.
   *
   * @tag logs
   * @summary 동아리별 로그 조회
   * @param clubId 조회할 동아리의 ID
   * @param pagination 페이지네이션 정보
   * @returns 동아리의 로그 목록
   */
  @TypedRoute.Get('club/:clubId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getLogsByClub(
    @TypedParam('clubId') clubId: number,
    @TypedQuery() pagination: PaginationDto,
  ): Promise<Log[]> {
    const query = new GetLogsByClubQuery(
      clubId,
      pagination.page || 1,
      pagination.limit || 50,
    );
    return this.queryBus.execute(query);
  }

  /**
   * 특정 액션의 로그를 조회합니다.
   *
   * @tag logs
   * @summary 액션별 로그 조회
   * @param action 조회할 액션 (CREATE, APPLY, BOOKMARK 등)
   * @param pagination 페이지네이션 정보
   * @returns 액션의 로그 목록
   */
  @TypedRoute.Get('action/:action')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getLogsByAction(
    @TypedParam('action') action: LogAction,
    @TypedQuery() pagination: PaginationDto,
  ): Promise<Log[]> {
    const query = new GetLogsByActionQuery(
      action,
      pagination.page || 1,
      pagination.limit || 50,
    );
    return this.queryBus.execute(query);
  }

  /**
   * 모든 로그를 조회합니다. 날짜 범위로 필터링 가능합니다.
   *
   * @tag logs
   * @summary 전체 로그 조회
   * @param query 쿼리 파라미터 (page, limit, startDate, endDate)
   * @returns 전체 로그 목록
   */
  @TypedRoute.Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async getAllLogs(@TypedQuery() query: GetAllLogsDto): Promise<Log[]> {
    const start = query.startDate ? new Date(query.startDate) : undefined;
    const end = query.endDate ? new Date(query.endDate) : undefined;

    const getAllLogsQuery = new GetAllLogsQuery(
      query.page || 1,
      query.limit || 50,
      start,
      end,
    );
    return this.queryBus.execute(getAllLogsQuery);
  }
}
