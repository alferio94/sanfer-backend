import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AppMenuService } from './app-menu.service';
import { CreateAppMenuDto } from './dto/create-app-menu.dto';
import { UpdateAppMenuDto } from './dto/update-app-menu.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@Controller('app-menu')
export class AppMenuController {
  constructor(private readonly appMenuService: AppMenuService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createAppMenuDto: CreateAppMenuDto) {
    const appMenu = await this.appMenuService.create(createAppMenuDto);
    return {
      message: 'App menu creado exitosamente',
      appMenu,
    };
  }

  @Get('event/:eventId')
  async findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    const appMenu = await this.appMenuService.findOrCreateByEventId(eventId);
    return {
      message: 'App menu obtenido exitosamente',
      appMenu,
    };
  }

  @Put('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateByEventId(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() updateAppMenuDto: UpdateAppMenuDto,
  ) {
    const appMenu = await this.appMenuService.updateByEventId(
      eventId,
      updateAppMenuDto,
    );
    return {
      message: 'App menu actualizado exitosamente',
      appMenu,
    };
  }

  @Delete('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('eventId', ParseUUIDPipe) eventId: string) {
    await this.appMenuService.remove(eventId);
  }
}