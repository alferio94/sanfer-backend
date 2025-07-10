import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { SurveyQuestionService } from './survey-question.service';
import { CreateSurveyQuestionDto } from './dto/create-survey-question.dto';
import { UpdateSurveyQuestionDto } from './dto/update-survey-question.dto';

@Controller('survey-question')
export class SurveyQuestionController {
  constructor(private readonly surveyQuestionService: SurveyQuestionService) {}

  @Post()
  create(@Body() dto: CreateSurveyQuestionDto) {
    return this.surveyQuestionService.create(dto);
  }

  @Get()
  findAll() {
    return this.surveyQuestionService.findAll();
  }

  @Get('survey/:surveyId')
  findBySurveyId(@Param('surveyId', ParseUUIDPipe) surveyId: string) {
    return this.surveyQuestionService.findBySurveyId(surveyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyQuestionService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSurveyQuestionDto,
  ) {
    return this.surveyQuestionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyQuestionService.remove(id);
  }
}
