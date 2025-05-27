/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateEventAgendumDto } from './dto/create-event-agendum.dto';
import { UpdateEventAgendumDto } from './dto/update-event-agendum.dto';
import { EventAgenda } from './entities/event-agenda.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEvent } from 'src/event/entities/event.entity';
import { EventGroup } from 'src/event-group/entities/event-group.entity';

@Injectable()
export class EventAgendaService {
  constructor(
    @InjectRepository(EventAgenda)
    private readonly agendaRepo: Repository<EventAgenda>,

    @InjectRepository(AppEvent)
    private readonly eventRepo: Repository<AppEvent>,

    @InjectRepository(EventGroup)
    private readonly groupRepo: Repository<EventGroup>,
  ) {}

  async create(dto: CreateEventAgendumDto): Promise<EventAgenda> {
    const event = await this.eventRepo.findOneByOrFail({ id: dto.eventId });

    const groups = await this.groupRepo.find({
      where: { id: In(dto.groupIds) },
    });

    const agenda = this.agendaRepo.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      event,
      groups,
    });

    return this.agendaRepo.save(agenda);
  }

  findAll(): Promise<EventAgenda[]> {
    return this.agendaRepo.find({
      relations: ['event', 'groups'],
      order: { startDate: 'ASC' },
    });
  }

  findOne(id: string): Promise<EventAgenda> {
    return this.agendaRepo.findOneOrFail({
      where: { id },
      relations: ['event', 'groups'],
    });
  }

  async update(id: string, dto: UpdateEventAgendumDto): Promise<EventAgenda> {
    const agenda = await this.findOne(id);

    if (dto.eventId) {
      agenda.event = await this.eventRepo.findOneByOrFail({ id: dto.eventId });
    }

    if (dto.groupIds) {
      agenda.groups = await this.groupRepo.find({
        where: { id: In(dto.groupIds) },
      });
    }

    Object.assign(agenda, {
      title: dto.title ?? agenda.title,
      description: dto.description ?? agenda.description,
      location: dto.location ?? agenda.location,
      startDate: dto.startDate ? new Date(dto.startDate) : agenda.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : agenda.endDate,
    });

    return this.agendaRepo.save(agenda);
  }

  async remove(id: string): Promise<void> {
    await this.agendaRepo.delete(id);
  }
}
