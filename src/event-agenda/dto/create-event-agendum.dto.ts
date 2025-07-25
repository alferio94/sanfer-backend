import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  ArrayNotEmpty,
  ArrayUnique,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Custom validator para verificar que endDate > startDate
@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
export class IsEndDateAfterStartDateConstraint
  implements ValidatorConstraintInterface
{
  validate(endDate: string, args: ValidationArguments): boolean {
    const startDate = (args.object as CreateEventAgendumDto).startDate;
    if (!startDate || !endDate) return true; // Si faltan fechas, otros validadores se encargarán

    return new Date(endDate) > new Date(startDate);
  }

  defaultMessage(args: ValidationArguments): string {
    return `End date must be after start date ${JSON.stringify(args.object)}`;
  }
}
export class CreateEventAgendumDto {
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Start date must be a string');
    }
    // Validar que la fecha no sea en el pasado
    const date = new Date(value);
    const now = new Date();
    if (date < now) {
      throw new Error('Start date cannot be in the past');
    }
    return value;
  })
  startDate: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @Validate(IsEndDateAfterStartDateConstraint)
  endDate: string;

  @IsString({ message: 'Title must be a string' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Title must be a string');
    }
    return value.trim();
  })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Transform(({ value }: { value: unknown }): string | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== 'string') {
      throw new Error('Description must be a string');
    }
    return value.trim();
  })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  @Transform(({ value }: { value: unknown }): string | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== 'string') {
      throw new Error('Location must be a string');
    }
    return value.trim();
  })
  location?: string;

  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId: string;

@IsOptional()
  @ArrayUnique({ message: 'Group IDs must be unique' })
  @IsUUID('4', { each: true, message: 'Each group ID must be a valid UUID' })
  groupIds?: string[];
}
