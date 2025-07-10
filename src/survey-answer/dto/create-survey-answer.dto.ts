import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateSurveyAnswerDto {
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

  @IsUUID('4', { message: 'Survey response ID must be a valid UUID' })
  surveyResponseId: string;

  @IsUUID('4', { message: 'Question ID must be a valid UUID' })
  questionId: string;
}
