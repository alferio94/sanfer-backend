import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Usuario } from './entities/usuario.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const existingUser = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
    
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password: hashedPassword,
    });

    return this.usuarioRepository.save(usuario);
  }

  async login(loginUsuarioDto: LoginUsuarioDto): Promise<{ usuario: Omit<Usuario, 'password'>; accessToken: string; refreshToken: string; }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: loginUsuarioDto.email, activo: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginUsuarioDto.password, usuario.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...userResult } = usuario;
    const tokens = await this.generateTokens(usuario);

    return {
      usuario: userResult,
      ...tokens
    };
  }

  async findAll(): Promise<Omit<Usuario, 'password'>[]> {
    const usuarios = await this.usuarioRepository.find({
      where: { activo: true },
      select: ['id', 'email', 'nombre', 'apellido', 'rol', 'activo', 'createdAt', 'updatedAt'],
    });
    return usuarios;
  }

  async findOne(id: string): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, activo: true },
      select: ['id', 'email', 'nombre', 'apellido', 'rol', 'activo', 'createdAt', 'updatedAt'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }

    await this.usuarioRepository.update(id, updateUsuarioDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usuarioRepository.update(id, { activo: false });
  }

  private async generateTokens(usuario: Usuario): Promise<{ accessToken: string; refreshToken: string; }> {
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await this.refreshTokenRepository.save({
      token: hashedRefreshToken,
      usuarioId: usuario.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string; }> {
    const { refreshToken } = refreshTokenDto;
    
    const storedTokens = await this.refreshTokenRepository.find({
      where: {
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['usuario'],
    });

    let validToken: RefreshToken | null = null;
    for (const token of storedTokens) {
      const isValid = await bcrypt.compare(refreshToken, token.token);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    await this.refreshTokenRepository.update(validToken.id, { revoked: true });

    return this.generateTokens(validToken.usuario);
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const { refreshToken } = refreshTokenDto;
    
    const storedTokens = await this.refreshTokenRepository.find({
      where: {
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    for (const token of storedTokens) {
      const isValid = await bcrypt.compare(refreshToken, token.token);
      if (isValid) {
        await this.refreshTokenRepository.update(token.id, { revoked: true });
        break;
      }
    }
  }

  async validateUser(payload: any): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub, activo: true },
    });
    
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    return usuario;
  }
}