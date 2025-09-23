import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserCommand } from '../commands/create-user.command';
import { User } from '../entities/user.entity';
import { Log, LogAction, LogTargetType } from '../../logs/entities/log.entity';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const { email, name, role, grade } = command;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = this.userRepository.create({
      email,
      name,
      role: role,
      grade,
    });

    const savedUser = await this.userRepository.save(user);

    const log = this.logRepository.create({
      userId: savedUser.id,
      action: LogAction.REGISTER,
      targetType: LogTargetType.USER,
      targetId: savedUser.id,
      description: `새 사용자 '${name}'이 등록되었습니다.`,
    });
    await this.logRepository.save(log);

    return savedUser;
  }
}
