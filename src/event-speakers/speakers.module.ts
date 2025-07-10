import { Module } from '@nestjs/common';
import { SpeakerController } from './speakers.controller';
import { SpeakerService } from './speakers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Speaker } from './entities/speakers.entity';
import { AppEvent } from 'src/event/entities/event.entity';

@Module({
  controllers: [SpeakerController],
  imports: [TypeOrmModule.forFeature([Speaker, AppEvent])],
  providers: [SpeakerService],
})
export class SpeakersModule {}
