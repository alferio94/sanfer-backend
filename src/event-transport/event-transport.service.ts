import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { EventGroup } from 'src/event-group/entities/event-group.entity';
import { AppEvent } from 'src/event/entities/event.entity';
import { Repository, In } from 'typeorm';
import { EventTransport } from './entities/event-transport.entity';
import { CreateEventTransportDto } from './dto/create-event-transport.dto';
import { UpdateEventTransportDto } from './dto/update-event-transport.dto';

@Injectable()
export class EventTransportService {
  constructor(
    @InjectRepository(EventTransport)
    private readonly transportRepo: Repository<EventTransport>,

    @InjectRepository(AppEvent)
    private readonly eventRepo: Repository<AppEvent>,

    @InjectRepository(EventGroup)
    private readonly groupRepo: Repository<EventGroup>,
  ) {}

  async create(dto: CreateEventTransportDto): Promise<EventTransport> {
    try {
      // Verificar que el evento existe
      const event = await this.eventRepo.findOne({
        where: { id: dto.eventId },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }

      // Verificar que todos los grupos existen
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

      // Crear el transporte
      const transport = this.transportRepo.create({
        name: dto.name,
        details: dto.details,
        mapUrl: dto.mapUrl,
        type: dto.type,
        departureTime: new Date(dto.departureTime),
        event,
        groups,
      });

      return await this.transportRepo.save(transport);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<EventTransport[]> {
    return await this.transportRepo.find({
      relations: ['event', 'groups'],
      order: { departureTime: 'ASC' },
    });
  }

  async findByEventId(eventId: string): Promise<EventTransport[]> {
    // Verificar que el evento existe
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return await this.transportRepo.find({
      where: { event: { id: eventId } },
      relations: ['event', 'groups'],
      order: { departureTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventTransport> {
    const transport = await this.transportRepo.findOne({
      where: { id },
      relations: ['event', 'groups'],
    });

    if (!transport) {
      throw new NotFoundException(`Transport with ID ${id} not found`);
    }

    return transport;
  }

  async update(
    id: string,
    dto: UpdateEventTransportDto,
  ): Promise<EventTransport> {
    try {
      const transport = await this.findOne(id);

      // Si se proporciona un nuevo eventId, verificar que existe
      if (dto.eventId && dto.eventId !== transport.event.id) {
        const event = await this.eventRepo.findOne({
          where: { id: dto.eventId },
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
        }

        transport.event = event;
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

        transport.groups = groups;
      }

      // Actualizar campos opcionales solo si se proporcionan
      if (dto.name !== undefined) {
        transport.name = dto.name;
      }

      if (dto.details !== undefined) {
        transport.details = dto.details;
      }

      if (dto.mapUrl !== undefined) {
        transport.mapUrl = dto.mapUrl;
      }

      if (dto.type !== undefined) {
        transport.type = dto.type;
      }

      if (dto.departureTime !== undefined) {
        transport.departureTime = new Date(dto.departureTime);
      }

      return await this.transportRepo.save(transport);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const transport = await this.findOne(id);
    await this.transportRepo.remove(transport);
  }
}
