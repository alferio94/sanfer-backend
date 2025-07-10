import { Module } from '@nestjs/common';
import { EventUserModule } from './event-user/event-user.module';
import { EventModule } from './event/event.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { EventAgendaModule } from './event-agenda/event-agenda.module';
import { EventGroupModule } from './event-group/event-group.module';
import { SpeakersModule } from './event-speakers/speakers.module';
import { HotelModule } from './event-hotel/hotel.module';
import { SurveyModule } from './survey/survey.module';
import { SurveyQuestionModule } from './survey-question/survey-question.module';
import { SurveyResponseModule } from './survey-response/survey-response.module';
import { SurveyAnswerModule } from './survey-answer/survey-answer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    EventUserModule,
    EventModule,
    CommonModule,
    EventAgendaModule,
    EventGroupModule,
    SpeakersModule,
    HotelModule,
    SurveyModule,
    SurveyQuestionModule,
    SurveyResponseModule,
    SurveyAnswerModule,
  ],
})
export class AppModule {}
