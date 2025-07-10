import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TransportType } from '../entities/event-transport.entity';

// Validador personalizado para verificar que la fecha no sea en el pasado
@ValidatorConstraint({ name: 'isDepartureTimeInFuture', async: false })
export class IsDepartureTimeInFutureConstraint
  implements ValidatorConstraintInterface
{
  validate(departureTime: string): boolean {
    if (!departureTime) return true; // Otros validadores se encargarán

    const departureDate = new Date(departureTime);
    const now = new Date();
    return departureDate > now;
  }

  defaultMessage(): string {
    return 'Departure time must be in the future';
  }
}

export class CreateEventTransportDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Name must be a string');
    }
    return value.trim();
  })
  name: string;

  @IsOptional()
  @IsString({ message: 'Details must be a string' })
  @Transform(({ value }: { value: unknown }): string | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== 'string') {
      throw new Error('Details must be a string');
    }
    return value.trim();
  })
  details?: string;

  @IsOptional()
  @IsString({ message: 'Map URL must be a string' })
  @Transform(({ value }: { value: unknown }): string | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== 'string') {
      throw new Error('Map URL must be a string');
    }
    return value.trim();
  })
  mapUrl?: string;

  @IsEnum(TransportType, {
    message: 'Type must be one of: airplane, bus, train, van, boat',
  })
  type: TransportType;

  @IsDateString(
    {},
    { message: 'Departure time must be a valid ISO date string' },
  )
  @Validate(IsDepartureTimeInFutureConstraint)
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Departure time must be a string');
    }
    return value;
  })
  departureTime: string;

  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId: string;

  @ArrayNotEmpty({ message: 'At least one group must be assigned' })
  @ArrayUnique({ message: 'Group IDs must be unique' })
  @IsUUID('4', { each: true, message: 'Each group ID must be a valid UUID' })
  groupIds: string[];
}
