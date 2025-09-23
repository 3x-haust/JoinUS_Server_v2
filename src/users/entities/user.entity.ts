import { Club } from 'src/clubs/entities/club.entity';
import { Log } from 'src/logs/entities/log.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  ManyToMany,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  @Index()
  role: UserRole;

  @Column()
  name: string;

  @Column()
  @Index()
  grade: number;

  @Column({ nullable: true })
  oauthProvider: string;

  @Column({ nullable: true })
  oauthProviderId: string;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToMany(() => Club, (club) => club.teacher)
  teachingClubs: Club[];

  @ManyToMany(() => Club, (club) => club.applicants)
  joinedClubs: Club[];

  @ManyToMany(() => Club, (club) => club.bookmarkedBy)
  bookmarkedClubs: Club[];

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];
}
