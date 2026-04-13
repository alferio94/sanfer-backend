import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppEvent } from './entities/event.entity';
import { EventUserAssignment } from './entities/event-user-assignment.entity';
import { DataSource, Repository } from 'typeorm';
import { EventUserService } from 'src/event-user/event-user.service';
import { CreateEventUserDto } from 'src/event-user/dto/create-event-user.dto';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { hashPassword } from 'src/common/utils/hash.utils';
import { BulkAssignmentResult } from './interfaces/bulk-assignment-result.interface';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectRepository(AppEvent)
    private readonly eventRepository: Repository<AppEvent>,
    @InjectRepository(EventUserAssignment)
    private readonly eventUserAssignmentRepository: Repository<EventUserAssignment>,
    private readonly eventUserService: EventUserService,
    private readonly dataSource: DataSource,
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
  ): Promise<BulkAssignmentResult> {
    // --- Query 1: Validate event and load its groups ---
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['groups'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    // Empty array fast-path — no DB writes
    if (!users || users.length === 0) {
      return { created: 0, existing: 0, assigned: 0 };
    }

    // Build group lookup: lowercaseName → EventGroup (O(1) lookup in loop)
    const groupMap = new Map(
      event.groups.map((g) => [g.name.toLowerCase().trim(), g]),
    );

    // Hash password ONCE for all new users in this request
    const currentYear = new Date().getFullYear();
    const hashedPassword = await hashPassword(`Sanfer${currentYear}`);

    try {
      return await this.dataSource.transaction(async (manager) => {
        // --- Queries 2 & 3: Bulk create/fetch users ---
        const { userMap, created, existing } =
          await this.eventUserService.bulkCreateUsersIfNotExist(
            manager,
            users,
            hashedPassword,
          );

        if (userMap.size === 0) {
          return { created: 0, existing: 0, assigned: 0 };
        }

        // Build assignment rows; deduplicate by userId (same email twice in input)
        const seenUserIds = new Set<string>();
        const assignmentValues: { userId: string; eventId: string }[] = [];

        for (const userData of users) {
          const email = userData.email.toLowerCase().trim();
          const user = userMap.get(email);
          if (!user || seenUserIds.has(user.id)) continue;
          seenUserIds.add(user.id);
          assignmentValues.push({ userId: user.id, eventId: event.id });
        }

        const userIds = assignmentValues.map((a) => a.userId);

        // --- Query 4: Bulk insert assignments (ON CONFLICT DO NOTHING) ---
        if (assignmentValues.length > 0) {
          await manager
            .createQueryBuilder()
            .insert()
            .into('event_user_assignments', ['userId', 'eventId'])
            .values(assignmentValues)
            .orIgnore()
            .execute();
        }

        // --- Query 5: Fetch all assignments with existing groups for merge ---
        const assignments = await manager
          .getRepository(EventUserAssignment)
          .createQueryBuilder('a')
          .leftJoinAndSelect('a.groups', 'g')
          .leftJoinAndSelect('a.user', 'u')
          .where('a.eventId = :eventId', { eventId: event.id })
          .andWhere('u.id IN (:...userIds)', { userIds })
          .getMany();

        // Build assignmentMap: userId → assignment
        const assignmentMap = new Map<string, EventUserAssignment>(
          assignments.map((a) => [a.user.id, a]),
        );

        // --- Build junction rows in memory ---
        const junctionRows: { assignment_id: string; group_id: string }[] = [];

        for (const userData of users) {
          const email = userData.email.toLowerCase().trim();
          const user = userMap.get(email);
          if (!user) continue;

          const assignment = assignmentMap.get(user.id);
          if (!assignment) continue;

          const existingGroupIds = new Set(
            assignment.groups?.map((g) => g.id) || [],
          );

          const requestedGroupNames = (userData.groups || []).map((g) =>
            g.toLowerCase().trim(),
          );

          for (const groupName of requestedGroupNames) {
            const group = groupMap.get(groupName);
            if (!group || existingGroupIds.has(group.id)) continue;
            // Mark as seen for this assignment to avoid duplicate junction rows
            // within same request (same user listed multiple times with same group)
            existingGroupIds.add(group.id);
            junctionRows.push({
              assignment_id: assignment.id,
              group_id: group.id,
            });
          }
        }

        // --- Query 6: Bulk insert junction rows (ON CONFLICT DO NOTHING on PK) ---
        if (junctionRows.length > 0) {
          await manager
            .createQueryBuilder()
            .insert()
            .into('assignment_groups', ['assignment_id', 'group_id'])
            .values(junctionRows)
            .orIgnore()
            .execute();
        }

        this.logger.log(
          `Bulk assignment complete — eventId=${event.id}: ` +
            `created=${created}, existing=${existing}, assigned=${assignments.length}`,
        );

        return { created, existing, assigned: assignments.length };
      });
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<AppEvent[]> {
    return await this.eventRepository.find({
      relations: ['groups', 'appMenu'],
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
      relations: ['groups', 'appMenu'],
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

  async createUserAndAssign(
    eventId: string,
    createEventUserDto: CreateEventUserDto,
  ): Promise<{ message: string; user: any; assignment: any }> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['groups'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const user =
      await this.eventUserService.createUserIfNotExists(createEventUserDto);

    if (!user) {
      throw new Error('Failed to create or find user');
    }

    let assignment = await this.eventUserAssignmentRepository.findOne({
      where: {
        user: { id: user.id },
        event: { id: event.id },
      },
      relations: ['groups'],
    });

    if (assignment) {
      return {
        message: 'User already assigned to this event',
        user,
        assignment,
      };
    }

    const groupNamesLower = (createEventUserDto.groups || []).map((g) =>
      g.toLowerCase().trim(),
    );

    const matchedGroups = event.groups.filter((group) =>
      groupNamesLower.includes(group.name.toLowerCase().trim()),
    );

    assignment = this.eventUserAssignmentRepository.create({
      user,
      event,
      groups: matchedGroups,
    });

    try {
      await this.eventUserAssignmentRepository.save(assignment);
      return {
        message: 'User created and assigned to event successfully',
        user,
        assignment,
      };
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async removeUserFromEvent(eventId: string, userId: string): Promise<void> {
    const assignment = await this.eventUserAssignmentRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
      relations: ['event', 'user'],
    });

    if (!assignment) {
      throw new NotFoundException('User assignment not found for this event');
    }

    await this.eventUserAssignmentRepository.remove(assignment);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id); // Esto ya verifica que existe
    await this.eventRepository.remove(event);
  }

  async findEventsByUserId(userId: string): Promise<AppEvent[]> {
    const assignments = await this.eventUserAssignmentRepository.find({
      where: {
        user: { id: userId },
      },
      relations: [
        'event',
        'event.groups',
        'event.agendas',
        'event.appMenu',
        'groups',
      ],
    });

    const currentDate = new Date();

    return assignments
      .map((assignment) => assignment.event)
      .filter((event) => new Date(event.endDate) >= currentDate);
  }
}
