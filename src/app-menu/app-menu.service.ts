import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppMenu } from './entities/app-menu.entity';
import { CreateAppMenuDto } from './dto/create-app-menu.dto';
import { UpdateAppMenuDto } from './dto/update-app-menu.dto';
import { handleDBError } from 'src/common/utils/dbError.utils';

@Injectable()
export class AppMenuService {
  constructor(
    @InjectRepository(AppMenu)
    private appMenuRepository: Repository<AppMenu>,
  ) {}

  async create(createAppMenuDto: CreateAppMenuDto): Promise<AppMenu> {
    try {
      // Check if app menu already exists for this event
      const existingMenu = await this.appMenuRepository.findOne({
        where: { eventId: createAppMenuDto.eventId },
      });

      if (existingMenu) {
        throw new ConflictException(
          `App menu already exists for event ${createAppMenuDto.eventId}`,
        );
      }

      const appMenu = this.appMenuRepository.create(createAppMenuDto);
      return await this.appMenuRepository.save(appMenu);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findByEventId(eventId: string): Promise<AppMenu> {
    const appMenu = await this.appMenuRepository.findOne({
      where: { eventId },
      relations: ['event'],
    });

    if (!appMenu) {
      throw new NotFoundException(`App menu not found for event ${eventId}`);
    }

    return appMenu;
  }

  async updateByEventId(
    eventId: string,
    updateAppMenuDto: UpdateAppMenuDto,
  ): Promise<AppMenu> {
    try {
      const appMenu = await this.findByEventId(eventId);
      
      Object.assign(appMenu, updateAppMenuDto);
      
      return await this.appMenuRepository.save(appMenu);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async createDefaultForEvent(eventId: string): Promise<AppMenu> {
    try {
      const defaultMenu = this.appMenuRepository.create({
        eventId,
        transporte: true,
        alimentos: true,
        codigoVestimenta: true,
        ponentes: true,
        encuestas: true,
        hotel: true,
        agenda: true,
        atencionMedica: true,
        sede: true,
      });

      return await this.appMenuRepository.save(defaultMenu);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findOrCreateByEventId(eventId: string): Promise<AppMenu> {
    try {
      return await this.findByEventId(eventId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return await this.createDefaultForEvent(eventId);
      }
      throw error;
    }
  }

  async remove(eventId: string): Promise<void> {
    const appMenu = await this.findByEventId(eventId);
    await this.appMenuRepository.remove(appMenu);
  }
}