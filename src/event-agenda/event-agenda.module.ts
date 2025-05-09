import { Module } from '@nestjs/common';
import { EventAgendaService } from './event-agenda.service';
import { EventAgendaController } from './event-agenda.controller';
import { EventAgenda } from './entities/event-agenda.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [EventAgendaController],
  imports: [TypeOrmModule.forFeature([EventAgenda])],
  providers: [EventAgendaService],
})
export class EventAgendaModule {}
