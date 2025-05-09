import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppEvent } from './entities/event.entity';
import { EventUserAssignment } from './entities/event-user-assignment.entity';
import { EventUserModule } from 'src/event-user/event-user.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  imports: [
    TypeOrmModule.forFeature([AppEvent, EventUserAssignment]),
    EventUserModule,
  ],
})
export class EventModule {}
