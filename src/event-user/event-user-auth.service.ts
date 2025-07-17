import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EventUser } from './entities/event-user.entity';
import { EventUserRefreshToken } from './entities/event-user-refresh-token.entity';
import { LoginEventUserDto } from './dto/login-event-user.dto';
import { RefreshEventUserTokenDto } from './dto/refresh-event-user-token.dto';

@Injectable()
export class EventUserAuthService {
  constructor(
    @InjectRepository(EventUser)
    private eventUserRepository: Repository<EventUser>,
    @InjectRepository(EventUserRefreshToken)
    private eventUserRefreshTokenRepository: Repository<EventUserRefreshToken>,
    private jwtService: JwtService,
  ) {}

  async login(loginEventUserDto: LoginEventUserDto): Promise<{
    user: Omit<EventUser, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.eventUserRepository.findOne({
      where: { email: loginEventUserDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginEventUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password, ...userResult } = user;
    const tokens = await this.generateTokens(user);

    return {
      user: userResult,
      ...tokens,
    };
  }

  private async generateTokens(
    user: EventUser,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, type: 'event-user' };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.eventUserRefreshTokenRepository.save({
      token: hashedRefreshToken,
      eventUserId: user.id,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(
    refreshTokenDto: RefreshEventUserTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;

    const storedTokens = await this.eventUserRefreshTokenRepository.find({
      where: {
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    let validToken: EventUserRefreshToken | null = null;
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

    await this.eventUserRefreshTokenRepository.update(validToken.id, {
      revoked: true,
    });

    const user = await this.eventUserRepository.findOne({
      where: { id: validToken.eventUserId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.generateTokens(user);
  }

  async logout(refreshTokenDto: RefreshEventUserTokenDto): Promise<void> {
    const { refreshToken } = refreshTokenDto;

    const storedTokens = await this.eventUserRefreshTokenRepository.find({
      where: {
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    for (const token of storedTokens) {
      const isValid = await bcrypt.compare(refreshToken, token.token);
      if (isValid) {
        await this.eventUserRefreshTokenRepository.update(token.id, {
          revoked: true,
        });
        break;
      }
    }
  }
}
