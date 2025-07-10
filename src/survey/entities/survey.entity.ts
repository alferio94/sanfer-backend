import { AppEvent } from 'src/event/entities/event.entity';
import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { SurveyResponse } from 'src/survey-response/entities/survey-response.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SurveyType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

@Entity({ name: 'surveys' })
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: SurveyType,
    default: SurveyType.ENTRY,
  })
  type: SurveyType;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => AppEvent, (event) => event.surveys, {
    onDelete: 'CASCADE',
  })
  event: AppEvent;

  @OneToMany(() => SurveyQuestion, (question) => question.survey, {
    cascade: true,
  })
  questions: SurveyQuestion[];

  @OneToMany(() => SurveyResponse, (response) => response.survey)
  responses: SurveyResponse[];
}
