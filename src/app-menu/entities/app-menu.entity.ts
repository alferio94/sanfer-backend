import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { AppEvent } from 'src/event/entities/event.entity';

@Entity({ name: 'app_menus' })
export class AppMenu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ default: true })
  transporte: boolean;

  @Column({ default: true })
  alimentos: boolean;

  @Column({ default: true, name: 'codigo_vestimenta' })
  codigoVestimenta: boolean;

  @Column({ default: true })
  ponentes: boolean;

  @Column({ default: true })
  encuestas: boolean;

  @Column({ default: true })
  hotel: boolean;

  @Column({ default: true })
  agenda: boolean;

  @Column({ default: true, name: 'atencion_medica' })
  atencionMedica: boolean;

  @Column({ default: true })
  sede: boolean;

  @OneToOne(() => AppEvent)
  @JoinColumn({ name: 'event_id' })
  event: AppEvent;
}