import { UserRole } from '../entities/user.entity';

export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly grade: number,
  ) {}
}
