import { EventUser } from 'src/event-user/entities/event-user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AppEvent } from './event.entity';

@Entity({ name: 'event_user_assignments' })
@Unique(['event', 'user'])
export class EventUserAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventUser, (user) => user.assignments, { eager: true })
  user: EventUser;

  @ManyToOne(() => AppEvent, (event) => event.assignments, { eager: true })
  event: AppEvent;

  @Column('text', { default: [], array: true })
  groups: string[];
}
