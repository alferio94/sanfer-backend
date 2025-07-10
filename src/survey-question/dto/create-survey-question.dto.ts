import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { QuestionType } from '../entities/survey-question.entity';
export class CreateSurveyQuestionDto {
  @IsString({ message: 'Question text must be a string' })
  @MinLength(5, { message: 'Question text must be at least 5 characters long' })
  @Transform(({ value }: { value: unknown }): string => {
    if (typeof value !== 'string') {
      throw new Error('Question text must be a string');
    }
    return value.trim();
  })
  questionText: string;

  @IsEnum(QuestionType, {
    message:
      'Question type must be "text", "multiple_choice", "rating", or "boolean"',
  })
  questionType: QuestionType;

  @IsOptional()
  @IsBoolean({ message: 'IsRequired must be a boolean' })
  isRequired?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'Order must be a number' })
  order?: number;

  @IsOptional()
  @IsArray({ message: 'Options must be an array' })
  @IsString({ each: true, message: 'Each option must be a string' })
  options?: string[];

  @IsUUID('4', { message: 'Survey ID must be a valid UUID' })
  surveyId: string;
}
