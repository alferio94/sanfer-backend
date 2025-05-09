import { EventGroup } from 'src/event-group/entities/event-group.entity';
import { AppEvent } from 'src/event/entities/event.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'event_agendas' })
export class EventAgenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  location?: string;

  @ManyToOne(() => AppEvent, (event) => event.agendas, {
    onDelete: 'CASCADE',
  })
  event: AppEvent;

  @ManyToMany(() => EventGroup)
  @JoinTable()
  groups: EventGroup[];
}
