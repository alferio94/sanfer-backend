import { Module } from '@nestjs/common';
import { SurveyQuestionService } from './survey-question.service';
import { SurveyQuestionController } from './survey-question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyQuestion } from './entities/survey-question.entity';
import { Survey } from 'src/survey/entities/survey.entity';

@Module({
  controllers: [SurveyQuestionController],
  imports: [TypeOrmModule.forFeature([SurveyQuestion, Survey])],
  providers: [SurveyQuestionService],
})
export class SurveyQuestionModule {}
