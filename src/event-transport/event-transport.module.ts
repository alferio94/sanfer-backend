import { Module } from '@nestjs/common';
import { EventTransportService } from './event-transport.service';
import { EventTransportController } from './event-transport.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventGroup } from 'src/event-group/entities/event-group.entity';
import { AppEvent } from 'src/event/entities/event.entity';
import { EventTransport } from './entities/event-transport.entity';

@Module({
  controllers: [EventTransportController],
  imports: [TypeOrmModule.forFeature([EventTransport, AppEvent, EventGroup])],
  providers: [EventTransportService],
})
export class EventTransportModule {}
