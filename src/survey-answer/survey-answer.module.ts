import { Module } from '@nestjs/common';
import { SurveyAnswerService } from './survey-answer.service';
import { SurveyAnswerController } from './survey-answer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { Survey } from 'src/survey/entities/survey.entity';
import { SurveyAnswer } from './entities/survey-answer.entity';
import { SurveyResponse } from 'src/survey-response/entities/survey-response.entity';

@Module({
  controllers: [SurveyAnswerController],
  imports: [
    TypeOrmModule.forFeature([
      SurveyAnswer,
      SurveyQuestion,
      Survey,
      SurveyResponse,
    ]),
  ],
  providers: [SurveyAnswerService],
})
export class SurveyAnswerModule {}
