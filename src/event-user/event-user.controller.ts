import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { CreateEventUserDto } from './dto/create-event-user.dto';

@Controller('event-user')
export class EventUserController {
  constructor(private readonly eventUserService: EventUserService) {}
  @Post()
  async createUser(@Body() createEventUserDto: CreateEventUserDto) {
    return this.eventUserService.createUserIfNotExists(createEventUserDto);
  }
  @Get()
  findAll() {
    return this.eventUserService.findAll();
  }
  @Get(':eventId')
  findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventUserService.findUsersByEventId(eventId);
  }
}
