import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateHotelDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Name must be a string');
    }
    return value.trim();
  })
  name: string;

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

  @IsString({ message: 'Address must be a string' })
  @MinLength(5, { message: 'Address must be at least 5 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Address must be a string');
    }
    return value.trim();
  })
  address: string;

  @IsString({ message: 'Phone must be a string' })
  @MinLength(7, { message: 'Phone must be at least 7 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Phone must be a string');
    }
    return value.trim();
  })
  phone: string;

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

  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId: string;
}
