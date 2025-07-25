import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventAgendumDto } from './dto/create-event-agendum.dto';
import { UpdateEventAgendumDto } from './dto/update-event-agendum.dto';
import { EventAgenda } from './entities/event-agenda.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEvent } from 'src/event/entities/event.entity';
import { EventGroup } from 'src/event-group/entities/event-group.entity';
import { handleDBError } from 'src/common/utils/dbError.utils';

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
    try {
      // Verificar que el evento existe
      const event = await this.eventRepo.findOne({
        where: { id: dto.eventId },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }

      // Verificar que todos los grupos existen (solo si se proporcionaron grupos)
      let groups: EventGroup[] = [];
      if (dto.groupIds && dto.groupIds.length > 0) {
        groups = await this.groupRepo.find({
          where: { id: In(dto.groupIds) },
        });

        if (groups.length !== dto.groupIds.length) {
          const foundGroupIds = groups.map((group) => group.id);
          const missingGroupIds = dto.groupIds.filter(
            (id) => !foundGroupIds.includes(id),
          );
          throw new NotFoundException(
            `Groups with IDs ${missingGroupIds.join(', ')} not found`,
          );
        }
      }

      // Crear la agenda
      const agenda = this.agendaRepo.create({
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        event,
        groups,
      });

      return await this.agendaRepo.save(agenda);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<EventAgenda[]> {
    return await this.agendaRepo.find({
      relations: ['event', 'groups'],
      order: { startDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventAgenda> {
    const agenda = await this.agendaRepo.findOne({
      where: { id },
      relations: ['event', 'groups'],
    });

    if (!agenda) {
      throw new NotFoundException(`Agenda with ID ${id} not found`);
    }

    return agenda;
  }

  async update(id: string, dto: UpdateEventAgendumDto): Promise<EventAgenda> {
    try {
      const agenda = await this.findOne(id);

      // Si se proporciona un nuevo eventId, verificar que existe
      if (dto.eventId && dto.eventId !== agenda.event.id) {
        const event = await this.eventRepo.findOne({
          where: { id: dto.eventId },
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
        }

        agenda.event = event;
      }

      // Si se proporcionan nuevos groupIds, verificar que existen
      if (dto.groupIds) {
        const groups = await this.groupRepo.find({
          where: { id: In(dto.groupIds) },
        });

        if (groups.length !== dto.groupIds.length) {
          const foundGroupIds = groups.map((group) => group.id);
          const missingGroupIds = dto.groupIds.filter(
            (id) => !foundGroupIds.includes(id),
          );
          throw new NotFoundException(
            `Groups with IDs ${missingGroupIds.join(', ')} not found`,
          );
        }

        agenda.groups = groups;
      }

      // Actualizar campos opcionales solo si se proporcionan
      if (dto.title !== undefined) {
        agenda.title = dto.title;
      }

      if (dto.description !== undefined) {
        agenda.description = dto.description;
      }

      if (dto.location !== undefined) {
        agenda.location = dto.location;
      }

      if (dto.startDate !== undefined) {
        agenda.startDate = new Date(dto.startDate);
      }

      if (dto.endDate !== undefined) {
        agenda.endDate = new Date(dto.endDate);
      }

      return await this.agendaRepo.save(agenda);
    } catch (error) {
      handleDBError(error);
      throw error; // Re-throw si handleDBError no lanza excepción
    }
  }
  async findAgendaByEventId(eventId: string) {
    return await this.agendaRepo.find({
      where: { event: { id: eventId } },
      relations: ['event', 'groups'],
      order: { startDate: 'ASC' },
    });
  }

  async findAgendaByEventIdAndGroupId(eventId: string, groupId: string) {
    const agendas = await this.agendaRepo.find({
      where: { 
        event: { id: eventId },
        groups: { id: groupId }
      },
      relations: ['event', 'groups'],
      order: { startDate: 'ASC' },
    });

    // Format for React Native Calendar agenda component
    const formattedAgendas = {};
    
    agendas.forEach(agenda => {
      const dateKey = agenda.startDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      if (!formattedAgendas[dateKey]) {
        formattedAgendas[dateKey] = [];
      }
      
      formattedAgendas[dateKey].push({
        name: agenda.title,
        description: agenda.description,
        location: agenda.location,
        startDate: agenda.startDate,
        endDate: agenda.endDate,
        height: 50 // Default height for agenda items
      });
    });

    return formattedAgendas;
  }

  async remove(id: string): Promise<void> {
    const agenda = await this.findOne(id); // Esto ya verifica que existe
    await this.agendaRepo.remove(agenda);
  }
}
