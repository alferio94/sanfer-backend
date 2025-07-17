import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { CreateSurveyWithQuestionsDto } from './dto/create-survey-with-questions.dto';
import { UpdateSurveyWithQuestionsDto } from './dto/update-survey-with-questions.dto';
import { EventUserAuthGuard } from 'src/event-user/guards/event-user-auth.guard';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  create(@Body() dto: CreateSurveyDto) {
    return this.surveyService.create(dto);
  }

  @Post('with-questions')
  createWithQuestions(@Body() dto: CreateSurveyWithQuestionsDto) {
    return this.surveyService.createWithQuestions(dto);
  }

  @Get()
  findAll() {
    return this.surveyService.findAll();
  }

  @Get('event/:eventId')
  @UseGuards(EventUserAuthGuard)
  findByEventId(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.surveyService.findByEventId(eventId);
  }

  @Get(':id')
  @UseGuards(EventUserAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyService.findOne(id);
  }

  @Get(':id/with-questions')
  @UseGuards(EventUserAuthGuard)
  findWithQuestions(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyService.findWithQuestions(id);
  }

  @Get(':id/metrics')
  getSurveyMetrics(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyService.getSurveyMetrics(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSurveyDto) {
    return this.surveyService.update(id, dto);
  }

  @Put(':id/with-questions')
  updateWithQuestions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSurveyWithQuestionsDto,
  ) {
    return this.surveyService.updateWithQuestions(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyService.remove(id);
  }
}
