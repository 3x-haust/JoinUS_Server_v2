import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum LogAction {
  APPLY = 'APPLY',
  CANCEL_APPLY = 'CANCEL_APPLY',
  BOOKMARK = 'BOOKMARK',
  UNBOOKMARK = 'UNBOOKMARK',
  VIEW_CLUB_LIST = 'VIEW_CLUB_LIST',
  VIEW_CLUB_DETAIL = 'VIEW_CLUB_DETAIL',
  VIEW_MY_PAGE = 'VIEW_MY_PAGE',
  CREATE_CLUB = 'CREATE_CLUB',
  UPDATE_CLUB = 'UPDATE_CLUB',
  DELETE_CLUB = 'DELETE_CLUB',
  VIEW_APPLICANTS = 'VIEW_APPLICANTS',
  EXPORT_APPLICANTS = 'EXPORT_APPLICANTS',
  VIEW_TEACHER_PAGE = 'VIEW_TEACHER_PAGE',
  IMPORT_USERS_CSV = 'IMPORT_USERS_CSV',
  IMPORT_CLUBS_CSV = 'IMPORT_CLUBS_CSV',
  AUTO_CLOSE_CLUB = 'AUTO_CLOSE_CLUB',
  AUTO_OPEN_CLUB = 'AUTO_OPEN_CLUB',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
}

export enum LogTargetType {
  CLUB = 'CLUB',
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  PAGE = 'PAGE',
  FILE = 'FILE',
  AUTH = 'AUTH',
}

@Entity('logs')
@Index(['userId'])
@Index(['action'])
@Index(['targetType'])
@Index(['targetId'])
@Index(['createdAt'])
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: LogAction,
  })
  action: LogAction;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: LogTargetType,
  })
  targetType: LogTargetType;

  @Column({ name: 'target_id', nullable: true })
  targetId: number;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
