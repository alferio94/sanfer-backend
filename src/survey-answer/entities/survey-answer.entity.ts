import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { SurveyResponse } from 'src/survey-response/entities/survey-response.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'question_answers' })
export class SurveyAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  answerValue?: string; // Para respuestas de texto libre

  @Column({ nullable: true })
  selectedOption?: string; // Para multiple choice

  @Column({ type: 'int', nullable: true })
  ratingValue?: number; // Para ratings (1-5, 1-10, etc.)

  @Column({ type: 'boolean', nullable: true })
  booleanValue?: boolean; // Para preguntas sí/no

  @ManyToOne(() => SurveyResponse, (response) => response.answers, {
    onDelete: 'CASCADE',
  })
  surveyResponse: SurveyResponse;

  @ManyToOne(() => SurveyQuestion, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: SurveyQuestion;
}
