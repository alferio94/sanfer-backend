import { IsEmail } from 'class-validator';
import { EventUserAssignment } from 'src/event/entities/event-user-assignment.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'event_users' })
export class EventUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => EventUserAssignment, (assignment) => assignment.user)
  events: EventUserAssignment[];
}
