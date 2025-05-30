import { Injectable, Logger } from '@nestjs/common';
import { CreateEventUserDto } from './dto/create-event-user.dto';
import { EventUser } from './entities/event-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/common/utils/hash.utils';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { EventUserAssignment } from 'src/event/entities/event-user-assignment.entity';
import { EventGroup } from 'src/common/models/event-group.model';
interface EventUserWithGroups extends Omit<EventUser, 'password'> {
  assignedGroups: EventGroup[];
}
@Injectable()
export class EventUserService {
  private readonly logger = new Logger(EventUserService.name);

  constructor(
    @InjectRepository(EventUser)
    private readonly eventUserRepository: Repository<EventUser>,
    @InjectRepository(EventUserAssignment)
    private readonly eventUserAssignmentRepository: Repository<EventUserAssignment>,
  ) {}

  async createUserIfNotExists(
    createEventUserDto: CreateEventUserDto,
  ): Promise<EventUser | null> {
    const { email } = createEventUserDto;

    try {
      // Buscar usuario existente
      let eventUser = await this.eventUserRepository.findOne({
        where: { email },
      });

      if (eventUser) {
        this.logger.log(`User with email ${email} already exists`);
        return eventUser;
      }

      // Crear nuevo usuario
      const hashedPassword = await hashPassword('Sanfer2025');

      const newEventUser = this.eventUserRepository.create({
        ...createEventUserDto,
        password: hashedPassword,
      });

      eventUser = await this.eventUserRepository.save(newEventUser);
      this.logger.log(`Created new user with email ${email}`);

      return eventUser;
    } catch (error) {
      this.logger.error(
        `Failed to create/find user with email ${email}:`,
        error,
      );
      handleDBError(error);
      return null;
    }
  }

  async findAll(): Promise<EventUser[]> {
    return await this.eventUserRepository.find({
      relations: ['events', 'events.event', 'events.groups'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventUser | null> {
    return await this.eventUserRepository.findOne({
      where: { id },
      relations: ['events', 'events.event', 'events.groups'],
    });
  }

  async findByEmail(email: string): Promise<EventUser | null> {
    return await this.eventUserRepository.findOne({
      where: { email },
      relations: ['events', 'events.event', 'events.groups'],
    });
  }

  async findUsersByEventId(eventId: string): Promise<EventUser[]> {
    const assignments = await this.eventUserAssignmentRepository.find({
      where: { event: { id: eventId } },
      relations: ['user', 'groups'], // ← Agregar 'groups'
    });

    return assignments.map((assignment) => {
      return {
        ...assignment.user,
        assignedGroups: assignment.groups, // ← Agregar grupos asignados
      };
    });
  }
}
