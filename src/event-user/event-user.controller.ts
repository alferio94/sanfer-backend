import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventUserService } from './event-user.service';
import { EventUserAuthService } from './event-user-auth.service';
import { CreateEventUserDto } from './dto/create-event-user.dto';
import { LoginEventUserDto } from './dto/login-event-user.dto';
import { RefreshEventUserTokenDto } from './dto/refresh-event-user-token.dto';
import { EventUserAuthGuard } from './guards/event-user-auth.guard';

@Controller('event-user')
export class EventUserController {
  constructor(
    private readonly eventUserService: EventUserService,
    private readonly eventUserAuthService: EventUserAuthService,
  ) {}
  @Post()
  async createUser(@Body() createEventUserDto: CreateEventUserDto) {
    return this.eventUserService.createUserIfNotExists(createEventUserDto);
  }
  @Get()
  findAll() {
    return this.eventUserService.findAll();
  }
  @Get(':eventId')
  findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventUserService.findUsersByEventId(eventId);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginEventUserDto: LoginEventUserDto) {
    const result = await this.eventUserAuthService.login(loginEventUserDto);
    return {
      message: 'Login exitoso',
      ...result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshEventUserTokenDto) {
    const tokens =
      await this.eventUserAuthService.refreshTokens(refreshTokenDto);
    return {
      message: 'Tokens renovados exitosamente',
      ...tokens,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshEventUserTokenDto) {
    await this.eventUserAuthService.logout(refreshTokenDto);
    return {
      message: 'Logout exitoso',
    };
  }

  @Get('profile')
  @UseGuards(EventUserAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req) {
    const user = await this.eventUserService.findUserProfile(req.user.sub);
    return {
      user,
    };
  }
}
