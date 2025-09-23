import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';

interface AuthenticatedRequest {
  user: {
    id: number;
    scopes?: string[];
    clientId?: string;
    role?: UserRole;
  };
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('인증이 필요합니다.');
    }

    const dbUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['id', 'role', 'email', 'name'],
    });

    if (!dbUser) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    request.user = { ...user, role: dbUser.role };

    const hasRole = requiredRoles.includes(dbUser.role);

    if (!hasRole) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return true;
  }
}
