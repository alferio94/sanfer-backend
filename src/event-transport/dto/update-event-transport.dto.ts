import { PartialType } from '@nestjs/mapped-types';
import { CreateEventTransportDto } from './create-event-transport.dto';

export class UpdateEventTransportDto extends PartialType(
  CreateEventTransportDto,
) {}
