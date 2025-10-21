import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { SurveyType } from '../entities/survey.entity';

export class QuestionForUpdateDto {
  @IsOptional()
  @IsUUID('4', { message: 'Question ID must be a valid UUID' })
  id?: string; // Si existe ID, se actualiza; si no, se crea nueva

  @IsString({ message: 'Question text must be a string' })
  @MinLength(5, { message: 'Question text must be at least 5 characters long' })
  questionText: string;

  @IsEnum(['text', 'multiple_choice', 'rating', 'boolean'], {
    message:
      'Question type must be "text", "multiple_choice", "rating", or "boolean"',
  })
  questionType: 'text' | 'multiple_choice' | 'rating' | 'boolean';

  @IsOptional()
  @IsBoolean({ message: 'IsRequired must be a boolean' })
  isRequired?: boolean;

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsArray({ message: 'Options must be an array' })
  @IsString({ each: true, message: 'Each option must be a string' })
  options?: string[];
}

export class UpdateSurveyWithQuestionsDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(SurveyType, { message: 'Type must be either "entry" or "exit"' })
  type?: SurveyType;

  @IsOptional()
  @IsBoolean({ message: 'IsActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @ArrayUnique({ message: 'Group IDs must be unique' })
  @IsUUID('4', { each: true, message: 'Each group ID must be a valid UUID' })
  groupIds?: string[];

  @IsOptional()
  @IsArray({ message: 'Questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => QuestionForUpdateDto)
  questions?: QuestionForUpdateDto[];
}
