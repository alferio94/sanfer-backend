import { EventAgenda } from 'src/event-agenda/entities/event-agenda.entity';
import { EventUserAssignment } from 'src/event/entities/event-user-assignment.entity';
import { AppEvent } from 'src/event/entities/event.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'event_groups' })
export class EventGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToOne(() => AppEvent, (event) => event.groups, {
    onDelete: 'CASCADE',
  })
  event: AppEvent;

  @ManyToMany(() => EventAgenda, (activity) => activity.groups)
  activities: EventAgenda[];

  @ManyToMany(
    () => EventUserAssignment,
    (userAssignment) => userAssignment.groups,
  )
  assignments: EventUserAssignment[];
}
