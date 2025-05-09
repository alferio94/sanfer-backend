import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EventUserAssignment } from './event-user-assignment.entity';
import { EventAgenda } from 'src/event-agenda/entities/event-agenda.entity';
import { EventGroup } from 'src/event-group/entities/event-group.entity';

@Entity({ name: 'events' })
export class AppEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  campus?: string;

  @Column({ nullable: true })
  campusPhone?: string;

  @Column({ nullable: true })
  campusMap?: string;

  @Column({ nullable: true })
  dressCode?: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  tips?: string;

  @Column({ nullable: true })
  extra?: string;

  @Column({ nullable: true })
  banner?: string;

  @Column({ nullable: true })
  campusImage?: string;

  @Column({ nullable: true })
  dressCodeImage?: string;

  @OneToMany(() => EventGroup, (group) => group.event, { cascade: true })
  groups: EventGroup[];

  @OneToMany(() => EventUserAssignment, (assignment) => assignment.event)
  users?: EventUserAssignment[];

  @OneToMany(() => EventAgenda, (agenda) => agenda.event)
  agendas?: EventAgenda[];
}
