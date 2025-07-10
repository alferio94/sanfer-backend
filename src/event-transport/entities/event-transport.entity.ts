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
export enum TransportType {
  AIRPLANE = 'airplane',
  BUS = 'bus',
  TRAIN = 'train',
  VAN = 'van',
  BOAT = 'boat',
}

@Entity({ name: 'event_transports' })
export class EventTransport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  details?: string;

  @Column({ nullable: true })
  mapUrl?: string;

  @Column({
    type: 'enum',
    enum: TransportType,
    default: TransportType.BUS,
  })
  type: TransportType;

  @Column({ type: 'timestamp' })
  departureTime: Date;

  @ManyToOne(() => AppEvent, (event) => event.transports, {
    onDelete: 'CASCADE',
  })
  event: AppEvent;

  @ManyToMany(() => EventGroup)
  @JoinTable()
  groups: EventGroup[];
}
