import { Injectable } from '@nestjs/common';
import { CreateEventAgendumDto } from './dto/create-event-agendum.dto';
import { UpdateEventAgendumDto } from './dto/update-event-agendum.dto';

@Injectable()
export class EventAgendaService {
  create(createEventAgendumDto: CreateEventAgendumDto) {
    return 'This action adds a new eventAgendum';
  }

  findAll() {
    return `This action returns all eventAgenda`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventAgendum`;
  }

  update(id: number, updateEventAgendumDto: UpdateEventAgendumDto) {
    return `This action updates a #${id} eventAgendum`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventAgendum`;
  }
}
