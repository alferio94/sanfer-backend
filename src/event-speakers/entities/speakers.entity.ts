import { AppEvent } from 'src/event/entities/event.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'speakers' })
export class Speaker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  presentation: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @ManyToOne(() => AppEvent, (event) => event.speakers, {
    onDelete: 'CASCADE',
  })
  event: AppEvent;
}
