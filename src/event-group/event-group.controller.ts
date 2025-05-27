import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { EventGroupService } from './event-group.service';
import { CreateEventGroupDto } from './dto/create-event-group.dto';
import { UpdateEventGroupDto } from './dto/update-event-group.dto';

@Controller('event-group')
export class EventGroupController {
  constructor(private readonly eventGroupService: EventGroupService) {}

  @Post('event/:eventId')
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() createEventGroupDto: CreateEventGroupDto,
  ) {
    return this.eventGroupService.create(eventId, createEventGroupDto);
  }

  @Get('event/:eventId')
  findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventGroupService.findGroupsByEventId(eventId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventGroupService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventGroupDto: UpdateEventGroupDto,
  ) {
    return this.eventGroupService.update(id, updateEventGroupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventGroupService.remove(id);
  }
}
