import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { AppEvent } from 'src/event/entities/event.entity';
import { Repository } from 'typeorm';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Hotel } from './entities/hotel.entity';

@Injectable()
export class HotelService {
  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepo: Repository<Hotel>,

    @InjectRepository(AppEvent)
    private readonly eventRepo: Repository<AppEvent>,
  ) {}

  async create(dto: CreateHotelDto): Promise<Hotel> {
    try {
      // Verificar que el evento existe
      const event = await this.eventRepo.findOne({
        where: { id: dto.eventId },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }

      // Crear el hotel
      const hotel = this.hotelRepo.create({
        name: dto.name,
        photoUrl: dto.photoUrl,
        address: dto.address,
        phone: dto.phone,
        mapUrl: dto.mapUrl,
        event,
      });

      return await this.hotelRepo.save(hotel);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<Hotel[]> {
    return await this.hotelRepo.find({
      relations: ['event'],
      order: { name: 'ASC' },
    });
  }

  async findByEventId(eventId: string): Promise<Hotel[]> {
    // Verificar que el evento existe
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return await this.hotelRepo.find({
      where: { event: { id: eventId } },
      relations: ['event'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepo.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel with ID ${id} not found`);
    }

    return hotel;
  }

  async update(id: string, dto: UpdateHotelDto): Promise<Hotel> {
    try {
      const hotel = await this.findOne(id);

      // Si se proporciona un nuevo eventId, verificar que existe
      if (dto.eventId && dto.eventId !== hotel.event.id) {
        const event = await this.eventRepo.findOne({
          where: { id: dto.eventId },
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
        }

        hotel.event = event;
      }

      // Actualizar campos opcionales solo si se proporcionan
      if (dto.name !== undefined) {
        hotel.name = dto.name;
      }

      if (dto.photoUrl !== undefined) {
        hotel.photoUrl = dto.photoUrl;
      }

      if (dto.address !== undefined) {
        hotel.address = dto.address;
      }

      if (dto.phone !== undefined) {
        hotel.phone = dto.phone;
      }

      if (dto.mapUrl !== undefined) {
        hotel.mapUrl = dto.mapUrl;
      }

      return await this.hotelRepo.save(hotel);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const hotel = await this.findOne(id); // Esto ya verifica que existe
    await this.hotelRepo.remove(hotel);
  }
}
