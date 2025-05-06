import { Module } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { EventUserController } from './event-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventUser } from './entities/event-user.entity';

@Module({
  controllers: [EventUserController],
  providers: [EventUserService],
  imports: [TypeOrmModule.forFeature([EventUser])],
})
export class EventUserModule {}
