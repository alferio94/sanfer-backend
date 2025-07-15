import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EventUserService } from './event-user.service';

@Injectable()
export class EventUserJwtStrategy extends PassportStrategy(Strategy, 'event-user-jwt') {
  constructor(private eventUserService: EventUserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'event-user') {
      throw new UnauthorizedException();
    }
    
    const user = await this.eventUserService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}