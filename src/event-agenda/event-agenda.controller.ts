import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventAgendaService } from './event-agenda.service';
import { CreateEventAgendumDto } from './dto/create-event-agendum.dto';
import { UpdateEventAgendumDto } from './dto/update-event-agendum.dto';

@Controller('event-agenda')
export class EventAgendaController {
  constructor(private readonly eventAgendaService: EventAgendaService) {}

  @Post()
  create(@Body() createEventAgendumDto: CreateEventAgendumDto) {
    return this.eventAgendaService.create(createEventAgendumDto);
  }

  @Get()
  findAll() {
    return this.eventAgendaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventAgendaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventAgendumDto: UpdateEventAgendumDto,
  ) {
    return this.eventAgendaService.update(+id, updateEventAgendumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventAgendaService.remove(+id);
  }
}
