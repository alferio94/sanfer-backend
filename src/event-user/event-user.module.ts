import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventUserService } from './event-user.service';
import { EventUserAuthService } from './event-user-auth.service';
import { EventUserController } from './event-user.controller';
import { EventUserJwtStrategy } from './event-user-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventUser } from './entities/event-user.entity';
import { EventUserAssignment } from 'src/event/entities/event-user-assignment.entity';
import { RefreshToken } from 'src/usuarios/entities/refresh-token.entity';

@Module({
  controllers: [EventUserController],
  providers: [EventUserService, EventUserAuthService, EventUserJwtStrategy],
  imports: [
    TypeOrmModule.forFeature([EventUser, EventUserAssignment, RefreshToken]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  exports: [EventUserService],
})
export class EventUserModule {}
