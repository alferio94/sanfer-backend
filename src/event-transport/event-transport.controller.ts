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
import { EventTransportService } from './event-transport.service';
import { CreateEventTransportDto } from './dto/create-event-transport.dto';
import { UpdateEventTransportDto } from './dto/update-event-transport.dto';
import { EventUserAuthGuard } from 'src/event-user/guards/event-user-auth.guard';

@Controller('event-transport')
export class EventTransportController {
  constructor(private readonly transportService: EventTransportService) {}

  @Post()
  create(@Body() dto: CreateEventTransportDto) {
    return this.transportService.create(dto);
  }

  @Get()
  findAll() {
    return this.transportService.findAll();
  }

  @Get('event/:eventId')
  findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.transportService.findByEventId(eventId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transportService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventTransportDto,
  ) {
    return this.transportService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.transportService.remove(id);
  }
}
