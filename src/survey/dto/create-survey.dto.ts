import {
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  ArrayUnique,
} from 'class-validator';
import { SurveyType } from '../entities/survey.entity';
import { Transform } from 'class-transformer';

export class CreateSurveyDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
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

  @IsEnum(SurveyType, { message: 'Type must be either "entry" or "exit"' })
  type: SurveyType;

  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;

  @IsUUID('4', { message: 'Event ID must be a valid UUID' })
  eventId: string;

  @IsOptional()
  @ArrayUnique({ message: 'Group IDs must be unique' })
  @IsUUID('4', { each: true, message: 'Each group ID must be a valid UUID' })
  groupIds?: string[];
}
