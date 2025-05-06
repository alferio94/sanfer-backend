import { Injectable } from '@nestjs/common';
import { CreateEventUserDto } from './dto/create-event-user.dto';
import { UpdateEventUserDto } from './dto/update-event-user.dto';

@Injectable()
export class EventUserService {
  create(createEventUserDto: CreateEventUserDto) {
    return 'This action adds a new eventUser';
  }

  findAll() {
    return `This action returns all eventUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventUser`;
  }

  update(id: number, updateEventUserDto: UpdateEventUserDto) {
    return `This action updates a #${id} eventUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventUser`;
  }
}
