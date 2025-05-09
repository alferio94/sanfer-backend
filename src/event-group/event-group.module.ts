import { Module } from '@nestjs/common';
import { EventGroupService } from './event-group.service';
import { EventGroupController } from './event-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventGroup } from './entities/event-group.entity';
import { AppEvent } from 'src/event/entities/event.entity';

@Module({
  controllers: [EventGroupController],
  imports: [TypeOrmModule.forFeature([EventGroup, AppEvent])],
  providers: [EventGroupService],
})
export class EventGroupModule {}
