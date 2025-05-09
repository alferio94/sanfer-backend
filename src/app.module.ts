import { Module } from '@nestjs/common';
import { EventUserModule } from './event-user/event-user.module';
import { EventModule } from './event/event.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { EventAgendaModule } from './event-agenda/event-agenda.module';
import { EventGroupModule } from './event-group/event-group.module';

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
  ],
})
export class AppModule {}
