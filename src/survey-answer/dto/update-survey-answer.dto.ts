import { PartialType } from '@nestjs/mapped-types';
import { CreateSurveyAnswerDto } from './create-survey-answer.dto';

export class UpdateSurveyAnswerDto extends PartialType(CreateSurveyAnswerDto) {}
