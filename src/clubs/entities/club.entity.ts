import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
  VersionColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('clubs')
@Index(['name'], { unique: true })
@Index(['teacherId'])
@Index(['startDate'])
@Index(['endDate'])
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  teacherId: number;

  @ManyToOne(() => User, (user) => user.teachingClubs)
  teacher: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  preview: string;

  @Column('text')
  description: string;

  @Column('int', { array: true })
  capacity: number[];

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({ default: true })
  isApplicationOpen: boolean;

  @Column({ default: 0 })
  currentApplicantCount: number;

  @VersionColumn()
  version: number;

  @ManyToMany(() => User, (user) => user.joinedClubs)
  @JoinTable()
  applicants: User[];

  @ManyToMany(() => User, (user) => user.bookmarkedClubs)
  @JoinTable()
  bookmarkedBy: User[];
}
