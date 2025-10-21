import { Module } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppEvent } from 'src/event/entities/event.entity';
import { EventGroup } from 'src/event-group/entities/event-group.entity';
import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { Survey } from './entities/survey.entity';

@Module({
  controllers: [SurveyController],
  imports: [
    TypeOrmModule.forFeature([Survey, AppEvent, EventGroup, SurveyQuestion]),
  ],
  providers: [SurveyService],
})
export class SurveyModule {}
