import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
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
  findAssignments(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('user', ParseUUIDPipe) user: string,
  ) {
    return this.eventService.findAssignments(id, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.remove(id);
  }
}
