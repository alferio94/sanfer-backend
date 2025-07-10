import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AnswerDto {
  @IsUUID('4', { message: 'Question ID must be a valid UUID' })
  questionId: string;

  @IsOptional()
  @IsString({ message: 'Answer value must be a string' })
  answerValue?: string;

  @IsOptional()
  @IsString({ message: 'Selected option must be a string' })
  selectedOption?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Rating value must be a number' })
  ratingValue?: number;

  @IsOptional()
  @IsBoolean({ message: 'Boolean value must be a boolean' })
  booleanValue?: boolean;
}

export class SubmitSurveyResponseDto {
  @IsUUID('4', { message: 'Survey ID must be a valid UUID' })
  surveyId: string;

  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsArray({ message: 'Answers must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
