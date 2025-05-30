import { Module } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { EventUserController } from './event-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventUser } from './entities/event-user.entity';
import { EventUserAssignment } from 'src/event/entities/event-user-assignment.entity';

@Module({
  controllers: [EventUserController],
  providers: [EventUserService],
  imports: [TypeOrmModule.forFeature([EventUser, EventUserAssignment])],
  exports: [EventUserService],
})
export class EventUserModule {}
