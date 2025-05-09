import { Injectable } from '@nestjs/common';
import { CreateEventUserDto } from './dto/create-event-user.dto';
import { EventUser } from './entities/event-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/common/utils/hash.utils';

@Injectable()
export class EventUserService {
  constructor(
    @InjectRepository(EventUser)
    private readonly eventUserRepository: Repository<EventUser>,
  ) {}

  async createUserIfNotExists(createEventUserDto: CreateEventUserDto) {
    const { email } = createEventUserDto;
    const hashedPassword = await hashPassword('Sanfer2025');
    const eventUser = await this.eventUserRepository.findOne({
      where: { email },
    });
    if (!eventUser) {
      const newEventUser = this.eventUserRepository.create({
        ...createEventUserDto,
        password: hashedPassword,
      });
      try {
        await this.eventUserRepository.save(newEventUser);
        return newEventUser;
      } catch (error) {
        console.log(error);
      }
    }
    return eventUser;
  }

  findAll() {
    return this.eventUserRepository.find();
  }
}
