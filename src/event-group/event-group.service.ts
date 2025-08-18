import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(
    eventId: string,
    createEventGroupDto: CreateEventGroupDto,
  ): Promise<EventGroup> {
    const event = await this.appEventRepository.findOne({
      where: { id: eventId },
      relations: ['groups'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Verificar que no existe un grupo con el mismo nombre en este evento
    const existingGroup = event.groups.find(
      (g) => g.name.toLowerCase() === createEventGroupDto.name.toLowerCase(),
    );

    if (existingGroup) {
      throw new BadRequestException(
        `Group with name '${createEventGroupDto.name}' already exists in this event`,
      );
    }

    const newGroup = this.eventGroupRepository.create({
      ...createEventGroupDto,
      event,
    });

    try {
      return await this.eventGroupRepository.save(newGroup);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findGroupsByEventId(eventId: string): Promise<EventGroup[]> {
    // Verificar que el evento existe
    const event = await this.appEventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return await this.eventGroupRepository.find({
      where: {
        event: { id: eventId },
      },
      relations: ['event'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventGroup> {
    const group = await this.eventGroupRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async update(
    id: string,
    updateEventGroupDto: UpdateEventGroupDto,
  ): Promise<EventGroup> {
    try {
      const group = await this.findOne(id); // Esto ya verifica que existe

      // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
      if (updateEventGroupDto.name && updateEventGroupDto.name !== group.name) {
        const event = await this.appEventRepository.findOne({
          where: { id: group.event.id },
          relations: ['groups'],
        });

        const existingGroup = event?.groups.find(
          (g) =>
            g.id !== id &&
            g.name.toLowerCase() === updateEventGroupDto.name?.toLowerCase(),
        );

        if (existingGroup) {
          throw new BadRequestException(
            `Group with name '${updateEventGroupDto.name}' already exists in this event`,
          );
        }
      }

      Object.assign(group, updateEventGroupDto);

      return await this.eventGroupRepository.save(group);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    // Verificar que el grupo existe
    const group = await this.eventGroupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    try {
      // Usar delete() para evitar problemas con relaciones many-to-many
      // donde EventGroup no es el "owner" de las relaciones
      await this.eventGroupRepository.delete(id);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }
}
