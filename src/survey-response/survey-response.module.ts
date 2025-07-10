import { Module } from '@nestjs/common';
import { SurveyResponseService } from './survey-response.service';
import { SurveyResponseController } from './survey-response.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventUser } from 'src/event-user/entities/event-user.entity';
import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { Survey } from 'src/survey/entities/survey.entity';
import { SurveyResponse } from './entities/survey-response.entity';
import { SurveyAnswer } from 'src/survey-answer/entities/survey-answer.entity';

@Module({
  controllers: [SurveyResponseController],
  imports: [
    TypeOrmModule.forFeature([
      SurveyResponse,
      Survey,
      EventUser,
      SurveyAnswer,
      SurveyQuestion,
    ]),
  ],
  providers: [SurveyResponseService],
})
export class SurveyResponseModule {}
