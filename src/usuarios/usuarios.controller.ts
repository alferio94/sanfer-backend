import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('register')
  async register(@Body() createUsuarioDto: CreateUsuarioDto) {
    const usuario = await this.usuariosService.create(createUsuarioDto);
    const { password, ...result } = usuario;
    return {
      message: 'Usuario creado exitosamente',
      usuario: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUsuarioDto: LoginUsuarioDto) {
    const result = await this.usuariosService.login(loginUsuarioDto);
    return {
      message: 'Login exitoso',
      ...result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.usuariosService.refreshTokens(refreshTokenDto);
    return {
      message: 'Tokens renovados exitosamente',
      ...tokens,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    await this.usuariosService.logout(refreshTokenDto);
    return {
      message: 'Logout exitoso',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    const { password, ...usuario } = req.user;
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
      fechaCreacion: usuario.createdAt,
      fechaActualizacion: usuario.updatedAt,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const usuarios = await this.usuariosService.findAll();
    return {
      message: 'Usuarios obtenidos exitosamente',
      usuarios,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const usuario = await this.usuariosService.findOne(id);
    return {
      message: 'Usuario obtenido exitosamente',
      usuario,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    const usuario = await this.usuariosService.update(id, updateUsuarioDto);
    return {
      message: 'Usuario actualizado exitosamente',
      usuario,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usuariosService.remove(id);
  }
}

