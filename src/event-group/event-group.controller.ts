import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventGroupService } from './event-group.service';
import { CreateEventGroupDto } from './dto/create-event-group.dto';
import { UpdateEventGroupDto } from './dto/update-event-group.dto';

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

  @Get()
  findAll() {
    return this.eventGroupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventGroupService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventGroupDto: UpdateEventGroupDto,
  ) {
    return this.eventGroupService.update(+id, updateEventGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventGroupService.remove(+id);
  }
}
