import { AppEvent } from 'src/event/entities/event.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'hotels' })
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  mapUrl?: string;

  @ManyToOne(() => AppEvent, (event) => event.hotels, {
    onDelete: 'CASCADE',
  })
  event: AppEvent;
}
