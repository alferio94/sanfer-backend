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
import { EventAgendaService } from './event-agenda.service';
import { CreateEventAgendumDto } from './dto/create-event-agendum.dto';
import { UpdateEventAgendumDto } from './dto/update-event-agendum.dto';
import { EventUserAuthGuard } from 'src/event-user/guards/event-user-auth.guard';

@Controller('event-agenda')
export class EventAgendaController {
  constructor(private readonly agendaService: EventAgendaService) {}

  @Post()
  create(@Body() dto: CreateEventAgendumDto) {
    return this.agendaService.create(dto);
  }

  @Get(':eventId')
  @UseGuards(EventUserAuthGuard)
  findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.agendaService.findAgendaByEventId(eventId);
  }

  @Get(':eventId/group/:groupId')
  @UseGuards(EventUserAuthGuard)
  findByEventIdAndGroupId(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ) {
    return this.agendaService.findAgendaByEventIdAndGroupId(eventId, groupId);
  }

  @Get()
  findAll() {
    return this.agendaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.agendaService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventAgendumDto,
  ) {
    return this.agendaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.agendaService.remove(id);
  }
}
