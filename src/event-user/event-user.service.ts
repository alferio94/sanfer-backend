import { Injectable, Logger } from '@nestjs/common';
import { CreateEventUserDto } from './dto/create-event-user.dto';
import { EventUser } from './entities/event-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { hashPassword } from 'src/common/utils/hash.utils';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { EventUserAssignment } from 'src/event/entities/event-user-assignment.entity';
@Injectable()
export class EventUserService {
  private readonly logger = new Logger(EventUserService.name);

  constructor(
    @InjectRepository(EventUser)
    private readonly eventUserRepository: Repository<EventUser>,
    @InjectRepository(EventUserAssignment)
    private readonly eventUserAssignmentRepository: Repository<EventUserAssignment>,
  ) {}

  /**
   * Bulk insert users that don't exist yet (email conflict = DO NOTHING),
   * then SELECT all users whose emails match, returning a Map<lowercaseEmail, EventUser>.
   *
   * This method is designed to be called INSIDE an existing transaction via its EntityManager.
   * It computes the stats (created vs existing) by comparing what was in the DB before the insert.
   */
  async bulkCreateUsersIfNotExist(
    manager: EntityManager,
    users: CreateEventUserDto[],
    hashedPassword: string,
  ): Promise<{
    userMap: Map<string, EventUser>;
    created: number;
    existing: number;
  }> {
    if (!users || users.length === 0) {
      return { userMap: new Map(), created: 0, existing: 0 };
    }

    // Normalize & deduplicate emails before any DB operation
    const seen = new Set<string>();
    const uniqueUsers: CreateEventUserDto[] = [];
    for (const u of users) {
      const normalized = u.email.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueUsers.push({ ...u, email: normalized });
      }
    }

    const normalizedEmails = uniqueUsers.map((u) => u.email);

    // Step 1: SELECT existing users so we know how many already exist
    const existingUsers = await manager
      .createQueryBuilder(EventUser, 'user')
      .where('LOWER(user.email) IN (:...emails)', { emails: normalizedEmails })
      .getMany();

    const existingEmailSet = new Set(
      existingUsers.map((u) => u.email.toLowerCase().trim()),
    );

    // Step 2: Build insert values for NEW users only
    const newUserValues = uniqueUsers
      .filter((u) => !existingEmailSet.has(u.email))
      .map((u) => ({
        name: u.name,
        email: u.email,
        password: hashedPassword,
      }));

    if (newUserValues.length > 0) {
      await manager
        .createQueryBuilder()
        .insert()
        .into(EventUser)
        .values(newUserValues)
        .orIgnore() // ON CONFLICT (email) DO NOTHING — handles race conditions
        .execute();
    }

    // Step 3: SELECT all users (new + existing) to get their IDs
    const allUsers = await manager
      .createQueryBuilder(EventUser, 'user')
      .where('LOWER(user.email) IN (:...emails)', { emails: normalizedEmails })
      .getMany();

    const userMap = new Map<string, EventUser>();
    for (const user of allUsers) {
      userMap.set(user.email.toLowerCase().trim(), user);
    }

    return {
      userMap,
      created: newUserValues.length,
      existing: existingUsers.length,
    };
  }

  async createUserIfNotExists(
    createEventUserDto: CreateEventUserDto,
  ): Promise<EventUser | null> {
    const { email } = createEventUserDto;
    const normalizedEmail = email.toLowerCase().trim();

    try {
      // Buscar usuario existente (case-insensitive)
      let eventUser = await this.eventUserRepository
        .createQueryBuilder('user')
        .where('LOWER(user.email) = :email', { email: normalizedEmail })
        .getOne();

      if (eventUser) {
        this.logger.log(`User with email ${email} already exists`);
        return eventUser;
      }

      // Crear nuevo usuario con contraseña dinámica basada en el año actual
      const currentYear = new Date().getFullYear();
      const hashedPassword = await hashPassword(`Sanfer${currentYear}`);

      const newEventUser = this.eventUserRepository.create({
        ...createEventUserDto,
        email: normalizedEmail,
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
    const normalizedEmail = email.toLowerCase().trim();
    return await this.eventUserRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.events', 'events')
      .leftJoinAndSelect('events.event', 'event')
      .leftJoinAndSelect('events.groups', 'groups')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();
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

  async findUserProfile(
    userId: string,
  ): Promise<Omit<EventUser, 'password'> | null> {
    const user = await this.eventUserRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email'], // Solo seleccionar campos necesarios, excluir password
    });

    return user || null;
  }

  async bulkUpdatePasswords(year?: number): Promise<{
    message: string;
    updatedCount: number;
    newPassword: string;
    timestamp: Date;
  }> {
    try {
      const targetYear = year || new Date().getFullYear();
      const newPassword = `Sanfer${targetYear}`;
      const hashedPassword = await hashPassword(newPassword);

      // Obtener todos los usuarios
      const allUsers = await this.eventUserRepository.find();

      // Actualizar contraseña de cada usuario
      for (const user of allUsers) {
        user.password = hashedPassword;
      }

      // Guardar todos los usuarios actualizados
      await this.eventUserRepository.save(allUsers);

      this.logger.log(
        `Bulk password update completed. ${allUsers.length} users updated to ${newPassword}`,
      );

      return {
        message: 'Passwords updated successfully',
        updatedCount: allUsers.length,
        newPassword: newPassword,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to bulk update passwords:', error);
      handleDBError(error);
      throw error;
    }
  }
}
