import { PartialType } from '@nestjs/mapped-types';
import { CreateEventAgendumDto } from './create-event-agendum.dto';

export class UpdateEventAgendumDto extends PartialType(CreateEventAgendumDto) {}
