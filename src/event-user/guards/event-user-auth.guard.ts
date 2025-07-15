import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class EventUserAuthGuard extends AuthGuard('event-user-jwt') {}