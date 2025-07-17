import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EventUser } from './event-user.entity';

@Entity({ name: 'event_user_refresh_tokens' })
export class EventUserRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column({ name: 'event_user_id' })
  eventUserId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => EventUser)
  @JoinColumn({ name: 'event_user_id' })
  eventUser: EventUser;
}