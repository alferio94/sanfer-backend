import { Module } from '@nestjs/common';
import { EventAgendaService } from './event-agenda.service';
import { EventAgendaController } from './event-agenda.controller';
import { EventAgenda } from './entities/event-agenda.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventGroup } from 'src/event-group/entities/event-group.entity';
import { AppEvent } from 'src/event/entities/event.entity';

@Module({
  controllers: [EventAgendaController],
  imports: [TypeOrmModule.forFeature([EventAgenda, EventGroup, AppEvent])],
  providers: [EventAgendaService],
})
export class EventAgendaModule {}
