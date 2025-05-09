import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEvent } from './entities/event.entity';
import { EventUserAssignment } from './entities/event-user-assignment.entity';
import { Repository } from 'typeorm';
import { EventUserService } from 'src/event-user/event-user.service';
import { CreateEventUserDto } from 'src/event-user/dto/create-event-user.dto';
import { EventUser } from 'src/event-user/entities/event-user.entity';
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
  async create(createEventDto: CreateEventDto) {
    try {
      const event = this.eventRepository.create(createEventDto);
      return await this.eventRepository.save(event);
    } catch (error) {
      handleDBError(error);
    }
  }

  async createAssignment(id: string, users: CreateEventUserDto[]) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['groups'],
    });
    if (!event) throw new Error('Event not found');

    for (const userData of users) {
      const user = await this.eventUserService.createUserIfNotExists(userData);

      let assignment = await this.eventUserAssignmentRepository.findOne({
        where: {
          user: { id: user?.id },
          event: { id: event?.id },
        },
        relations: ['groups'],
      });

      // Normalizar nombres de grupos a lowercase
      const groupNamesLower = (userData.groups || []).map((g) =>
        g.toLowerCase(),
      );

      // Buscar grupos existentes en el evento que coincidan
      const matchedGroups = event.groups.filter((group) =>
        groupNamesLower.includes(group.name.toLowerCase()),
      );

      if (!assignment) {
        assignment = this.eventUserAssignmentRepository.create({
          user: user as EventUser,
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

  findAll() {
    return this.eventRepository.find({
      relations: ['users', 'users.user', 'groups'],
    });
  }

  findAssignments(id: string, user: string) {
    const assigments = this.eventUserAssignmentRepository.find({
      where: { event: { id }, user: { id: user } },
      relations: ['groups'],
    });
    return assigments;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
