import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OpenClubRegistrationCommand } from './commands/open-club-registration.command';
import { CloseClubRegistrationCommand } from './commands/close-club-registration.command';
import { TypedRoute, TypedBody } from '@nestia/core';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';

export interface SetRegistrationPeriodDto {
  startDate: string;
  endDate: string;
}

export interface CloseRegistrationDto {
  reason?: string;
}

export interface RegistrationResponse {
  success: boolean;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * 동아리 모집 기간 시작
   *
   * @tag admin
   * @summary 동아리 모집 기간을 설정하고 시작
   * @param dto 모집 기간 설정 정보
   * @returns 모집 시작 처리 결과
   */
  @TypedRoute.Post('registration/open')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async openRegistration(
    @TypedBody() dto: SetRegistrationPeriodDto,
  ): Promise<RegistrationResponse> {
    const result = await this.commandBus.execute<
      OpenClubRegistrationCommand,
      RegistrationResponse
    >(
      new OpenClubRegistrationCommand(
        new Date(dto.startDate),
        new Date(dto.endDate),
      ),
    );
    return result;
  }

  /**
   * 동아리 모집 기간 종료
   *
   * @tag admin
   * @summary 동아리 모집 기간을 조기 종료
   * @param dto 모집 종료 정보
   * @returns 모집 종료 처리 결과
   */
  @TypedRoute.Post('registration/close')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async closeRegistration(
    @TypedBody() dto: CloseRegistrationDto,
  ): Promise<RegistrationResponse> {
    const result = await this.commandBus.execute<
      CloseClubRegistrationCommand,
      RegistrationResponse
    >(new CloseClubRegistrationCommand(dto.reason));
    return result;
  }
}
