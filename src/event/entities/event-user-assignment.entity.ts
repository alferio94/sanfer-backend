import { EventUser } from 'src/event-user/entities/event-user.entity';
import {
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AppEvent } from './event.entity';
import { EventGroup } from 'src/event-group/entities/event-group.entity';

@Entity({ name: 'event_user_assignments' })
@Unique(['event', 'user'])
export class EventUserAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventUser, (user) => user.events)
  user: EventUser;

  @ManyToOne(() => AppEvent, (event) => event.users)
  event: AppEvent;

  @ManyToMany(() => EventGroup)
  @JoinTable({
    name: 'assignment_groups',
    joinColumn: { name: 'assignment_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  groups: EventGroup[];
}
