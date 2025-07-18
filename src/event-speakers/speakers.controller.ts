import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { SpeakerService } from './speakers.service';
import { EventUserAuthGuard } from 'src/event-user/guards/event-user-auth.guard';

@Controller('speaker')
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @Post()
  create(@Body() dto: CreateSpeakerDto) {
    return this.speakerService.create(dto);
  }

  @Get()
  findAll() {
    return this.speakerService.findAll();
  }

  @Get('event/:eventId')
  findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.speakerService.findByEventId(eventId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.speakerService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpeakerDto,
  ) {
    return this.speakerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.speakerService.remove(id);
  }
}
