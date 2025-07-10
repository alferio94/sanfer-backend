import { SurveyAnswer } from 'src/survey-answer/entities/survey-answer.entity';
import { Survey } from 'src/survey/entities/survey.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum QuestionType {
  TEXT = 'text',
  MULTIPLE_CHOICE = 'multiple_choice',
  RATING = 'rating',
  BOOLEAN = 'boolean',
}

@Entity({ name: 'survey_questions' })
export class SurveyQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  questionText: string;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.TEXT,
  })
  questionType: QuestionType;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: 1 })
  order: number;

  @Column({ type: 'json', nullable: true })
  options?: string[]; // Para multiple choice

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'CASCADE',
  })
  survey: Survey;
  @OneToMany(() => SurveyAnswer, (answer) => answer.question)
  answers: SurveyAnswer[];
}
