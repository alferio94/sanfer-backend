import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventGroupService } from './event-group.service';
import { CreateEventGroupDto } from './dto/create-event-group.dto';

@Controller('event-group')
export class EventGroupController {
  constructor(private readonly eventGroupService: EventGroupService) {}

  @Post(':id')
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    createEventGroupDto: CreateEventGroupDto,
  ) {
    return this.eventGroupService.create(id, createEventGroupDto);
  }

  @Get(':id')
  findByEventId(@Param('id') id: string) {
    return this.eventGroupService.findGroupsByEventId(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventGroupService.remove(id);
  }
}
