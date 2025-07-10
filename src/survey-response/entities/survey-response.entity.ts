import { EventUser } from 'src/event-user/entities/event-user.entity';
import { SurveyAnswer } from 'src/survey-answer/entities/survey-answer.entity';
import { Survey } from 'src/survey/entities/survey.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'survey_responses' })
@Unique(['survey', 'user']) // Un usuario solo puede responder una vez por encuesta
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  submittedAt: Date;

  @ManyToOne(() => Survey, (survey) => survey.responses, {
    onDelete: 'CASCADE',
  })
  survey: Survey;

  @ManyToOne(() => EventUser, (user) => user.surveyResponses)
  user: EventUser;

  @OneToMany(() => SurveyAnswer, (answer) => answer.surveyResponse, {
    cascade: true,
  })
  answers: SurveyAnswer[];
}
