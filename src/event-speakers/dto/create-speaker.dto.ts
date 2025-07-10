import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSpeakerDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Name must be a string');
    }
    return value.trim();
  })
  name: string;

  @IsString({ message: 'Presentation must be a string' })
  @MinLength(5, { message: 'Presentation must be at least 5 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Presentation must be a string');
    }
    return value.trim();
  })
  presentation: string;

  @IsString({ message: 'Specialty must be a string' })
  @MinLength(2, { message: 'Specialty must be at least 2 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Specialty must be a string');
    }
    return value.trim();
  })
  specialty: string;

  @IsOptional()
  @IsString({ message: 'Photo URL must be a string' })
  @Transform(({ value }: { value: unknown }): string | undefined => {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== 'string') {
      throw new Error('Photo URL must be a string');
    }
    return value.trim();
  })
  photoUrl?: string;

  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId: string;
}
