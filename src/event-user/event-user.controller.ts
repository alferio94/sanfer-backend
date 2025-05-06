import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { CreateEventUserDto } from './dto/create-event-user.dto';
import { UpdateEventUserDto } from './dto/update-event-user.dto';

@Controller('event-user')
export class EventUserController {
  constructor(private readonly eventUserService: EventUserService) {}

  @Post()
  create(@Body() createEventUserDto: CreateEventUserDto) {
    return this.eventUserService.create(createEventUserDto);
  }

  @Get()
  findAll() {
    return this.eventUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventUserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventUserDto: UpdateEventUserDto) {
    return this.eventUserService.update(+id, updateEventUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventUserService.remove(+id);
  }
}
