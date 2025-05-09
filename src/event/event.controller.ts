import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventUserDto } from 'src/event-user/dto/create-event-user.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Post('assignment/:id')
  createAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() users: CreateEventUserDto[],
  ) {
    return this.eventService.createAssignment(id, users);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }
  @Get(':id/assignments/:user')
  findAssigments(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('user', ParseUUIDPipe) user: string,
  ) {
    console.log(id, user);
    return this.eventService.findAssignments(id, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }
}
