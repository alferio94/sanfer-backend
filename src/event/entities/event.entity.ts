import { EventGroup } from 'src/commons/models/event-group.model';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventUserAssignment } from './event-user-assignment.entity';

@Entity({ name: 'events' })
export class AppEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  campus: string;

  @Column({ nullable: true })
  campusPhone: string;

  @Column({ nullable: true })
  campusMap: string;

  @Column({ nullable: true })
  dressCode: string;

  @Column('jsonb', { default: [] })
  groups: EventGroup[];

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  tips: string;

  @Column({ nullable: true })
  extra: string;

  @Column({ nullable: true })
  banner: string;

  @Column({ nullable: true })
  campusImage: string;

  @Column({ nullable: true })
  dressCodeImage: string;

  @OneToMany(() => EventUserAssignment, (assignment) => assignment.event)
  assignments?: EventUserAssignment[];
}
