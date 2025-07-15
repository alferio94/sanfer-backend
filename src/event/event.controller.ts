import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateEventUserDto } from 'src/event-user/dto/create-event-user.dto';
import { EventUserAuthGuard } from 'src/event-user/guards/event-user-auth.guard';

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

  @Post(':eventId/user')
  createUserAndAssign(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() createEventUserDto: CreateEventUserDto,
  ) {
    return this.eventService.createUserAndAssign(eventId, createEventUserDto);
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

  @UseGuards(EventUserAuthGuard)
  @Get('user/:userId')
  findEventsByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.eventService.findEventsByUserId(userId);
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

  @Delete(':eventId/user/:userId')
  removeUserFromEvent(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.eventService.removeUserFromEvent(eventId, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventService.remove(id);
  }
}
