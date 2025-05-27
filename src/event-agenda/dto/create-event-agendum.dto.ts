import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';
export class CreateEventAgendumDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsUUID()
  eventId: string;

  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  groupIds: string[];
}
