import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class AdminProvisionerService implements OnModuleInit {
  private readonly logger = new Logger(AdminProvisionerService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async onModuleInit() {
    const email = this.config.adminEmail;
    const name = this.config.adminName;
    const roleStr = (this.config.adminRole || 'admin').toLowerCase();
    const grade = this.config.adminGrade ?? 0;

    if (!email || !name) {
      this.logger.log(
        'Admin provisioner skipped (ADMIN_EMAIL or ADMIN_NAME not set).',
      );
      return;
    }

    const roleMap: Record<string, UserRole> = {
      admin: UserRole.ADMIN,
      teacher: UserRole.TEACHER,
      student: UserRole.STUDENT,
    };
    const role = roleMap[roleStr] ?? UserRole.ADMIN;

    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      const changed =
        existing.name !== name ||
        existing.role !== role ||
        existing.grade !== grade;

      if (changed) {
        existing.name = name;
        existing.role = role;
        existing.grade = grade;
        await this.users.save(existing);
        this.logger.log(`Admin user updated: ${email}`);
      } else {
        this.logger.log(`Admin user already provisioned: ${email}`);
      }
      return;
    }

    const user = this.users.create({
      email,
      name,
      role,
      grade,
    });
    await this.users.save(user);
    this.logger.log(`Admin user provisioned: ${email}`);
  }
}
