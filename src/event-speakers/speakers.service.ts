import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { AppEvent } from 'src/event/entities/event.entity';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { Speaker } from './entities/speakers.entity';

@Injectable()
export class SpeakerService {
  constructor(
    @InjectRepository(Speaker)
    private readonly speakerRepo: Repository<Speaker>,

    @InjectRepository(AppEvent)
    private readonly eventRepo: Repository<AppEvent>,
  ) {}

  async create(dto: CreateSpeakerDto): Promise<Speaker> {
    try {
      // Verificar que el evento existe
      const event = await this.eventRepo.findOne({
        where: { id: dto.eventId },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }

      // Crear el ponente
      const speaker = this.speakerRepo.create({
        name: dto.name,
        presentation: dto.presentation,
        specialty: dto.specialty,
        photoUrl: dto.photoUrl,
        event,
      });

      return await this.speakerRepo.save(speaker);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<Speaker[]> {
    return await this.speakerRepo.find({
      relations: ['event'],
      order: { name: 'ASC' },
    });
  }

  async findByEventId(eventId: string): Promise<Speaker[]> {
    // Verificar que el evento existe
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return await this.speakerRepo.find({
      where: { event: { id: eventId } },
      relations: ['event'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Speaker> {
    const speaker = await this.speakerRepo.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!speaker) {
      throw new NotFoundException(`Speaker with ID ${id} not found`);
    }

    return speaker;
  }

  async update(id: string, dto: UpdateSpeakerDto): Promise<Speaker> {
    try {
      const speaker = await this.findOne(id);

      // Si se proporciona un nuevo eventId, verificar que existe
      if (dto.eventId && dto.eventId !== speaker.event.id) {
        const event = await this.eventRepo.findOne({
          where: { id: dto.eventId },
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
        }

        speaker.event = event;
      }

      // Actualizar campos opcionales solo si se proporcionan
      if (dto.name !== undefined) {
        speaker.name = dto.name;
      }

      if (dto.presentation !== undefined) {
        speaker.presentation = dto.presentation;
      }

      if (dto.specialty !== undefined) {
        speaker.specialty = dto.specialty;
      }

      if (dto.photoUrl !== undefined) {
        speaker.photoUrl = dto.photoUrl;
      }

      return await this.speakerRepo.save(speaker);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const speaker = await this.findOne(id); // Esto ya verifica que existe
    await this.speakerRepo.remove(speaker);
  }
}
