import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEvent } from './entities/event.entity';
import { EventUserAssignment } from './entities/event-user-assignment.entity';
import { Repository } from 'typeorm';
import { EventUserService } from 'src/event-user/event-user.service';
import { CreateEventUserDto } from 'src/event-user/dto/create-event-user.dto';
import { handleDBError } from 'src/common/utils/dbError.utils';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(AppEvent)
    private readonly eventRepository: Repository<AppEvent>,
    @InjectRepository(EventUserAssignment)
    private readonly eventUserAssignmentRepository: Repository<EventUserAssignment>,
    private readonly eventUserService: EventUserService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<AppEvent> {
    try {
      const event = this.eventRepository.create(createEventDto);
      return await this.eventRepository.save(event);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async createAssignment(
    id: string,
    users: CreateEventUserDto[],
  ): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['groups'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    for (const userData of users) {
      const user = await this.eventUserService.createUserIfNotExists(userData);

      if (!user) {
        continue; // Skip si no se pudo crear/encontrar el usuario
      }

      let assignment = await this.eventUserAssignmentRepository.findOne({
        where: {
          user: { id: user.id },
          event: { id: event.id },
        },
        relations: ['groups'],
      });

      // Normalizar nombres de grupos a lowercase
      const groupNamesLower = (userData.groups || []).map((g) =>
        g.toLowerCase().trim(),
      );

      // Buscar grupos existentes en el evento que coincidan
      const matchedGroups = event.groups.filter((group) =>
        groupNamesLower.includes(group.name.toLowerCase().trim()),
      );

      if (!assignment) {
        assignment = this.eventUserAssignmentRepository.create({
          user: user,
          event,
          groups: matchedGroups,
        });
      } else {
        // Combinar grupos anteriores con nuevos sin duplicados
        const existingGroupIds = new Set(
          assignment.groups?.map((g) => g.id) || [],
        );
        const newGroups = matchedGroups.filter(
          (g) => !existingGroupIds.has(g.id),
        );
        assignment.groups = [...(assignment.groups || []), ...newGroups];
      }

      try {
        await this.eventUserAssignmentRepository.save(assignment);
      } catch (error) {
        handleDBError(error);
      }
    }
  }

  async findAll(): Promise<AppEvent[]> {
    return await this.eventRepository.find({
      relations: ['users', 'users.user', 'groups', 'agendas'],
      order: { startDate: 'ASC' },
    });
  }

  async findAssignments(
    eventId: string,
    userId: string,
  ): Promise<EventUserAssignment[]> {
    return await this.eventUserAssignmentRepository.find({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
      relations: ['groups', 'event', 'user'],
    });
  }

  async findOne(id: string): Promise<AppEvent> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['users', 'users.user', 'groups', 'agendas'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<AppEvent> {
    try {
      const event = await this.findOne(id); // Esto ya verifica que existe

      // Actualizar solo los campos proporcionados
      Object.assign(event, updateEventDto);

      return await this.eventRepository.save(event);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id); // Esto ya verifica que existe
    await this.eventRepository.remove(event);
  }
}
