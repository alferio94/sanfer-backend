import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEventGroupDto } from './dto/create-event-group.dto';
import { UpdateEventGroupDto } from './dto/update-event-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventGroup } from './entities/event-group.entity';
import { Repository } from 'typeorm';
import { AppEvent } from 'src/event/entities/event.entity';
import { handleDBError } from 'src/common/utils/dbError.utils';

@Injectable()
export class EventGroupService {
  constructor(
    @InjectRepository(EventGroup)
    private readonly eventGroupRepository: Repository<EventGroup>,
    @InjectRepository(AppEvent)
    private readonly appEventRepository: Repository<AppEvent>,
  ) {}
  async create(id: string, createEventGroupDto: CreateEventGroupDto) {
    const event = await this.appEventRepository.findOne({
      where: { id },
      relations: ['groups'],
    });
    if (!event) throw new BadRequestException('Event not found');
    const existingGroip = event.groups.find(
      (g) => g.name === createEventGroupDto.name,
    );
    if (existingGroip) throw new BadRequestException('Group already exists');
    const newGroup = this.eventGroupRepository.create({
      ...createEventGroupDto,
      event,
    });
    try {
      await this.eventGroupRepository.save(newGroup);
      return newGroup;
    } catch (error) {
      handleDBError(error);
    }
  }

  findAll() {
    return `This action returns all eventGroup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventGroup`;
  }

  update(id: number, updateEventGroupDto: UpdateEventGroupDto) {
    return `This action updates a #${id} eventGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventGroup`;
  }
}
