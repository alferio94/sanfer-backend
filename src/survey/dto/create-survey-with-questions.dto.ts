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

// DTO simplificado para preguntas sin surveyId
export class QuestionForSurveyDto {
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

export class CreateSurveyWithQuestionsDto {
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
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

  @IsArray({ message: 'Questions must be an array' })
  @ValidateNested({ each: true })
  @Type(() => QuestionForSurveyDto)
  questions: QuestionForSurveyDto[];
}
