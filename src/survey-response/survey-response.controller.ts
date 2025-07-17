import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SurveyResponseService } from './survey-response.service';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { SubmitSurveyResponseDto } from './dto/submit-survey-response.dto';
import { EventUserAuthGuard } from 'src/event-user/guards/event-user-auth.guard';

@Controller('survey-response')
export class SurveyResponseController {
  constructor(private readonly surveyResponseService: SurveyResponseService) {}

  @Post('submit')
  @UseGuards(EventUserAuthGuard)
  submitSurveyResponse(@Body() dto: SubmitSurveyResponseDto) {
    return this.surveyResponseService.submitSurveyResponse(dto);
  }

  @Post()
  create(@Body() createSurveyResponseDto: CreateSurveyResponseDto) {
    return this.surveyResponseService.create(createSurveyResponseDto);
  }

  @Get()
  findAll() {
    return this.surveyResponseService.findAll();
  }

  @Get('survey/:surveyId')
  findBySurveyId(@Param('surveyId', ParseUUIDPipe) surveyId: string) {
    return this.surveyResponseService.findBySurveyId(surveyId);
  }

  @Get('user/:userId')
  @UseGuards(EventUserAuthGuard)
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.surveyResponseService.findByUserId(userId);
  }

  @Get('check/:surveyId/:userId')
  @UseGuards(EventUserAuthGuard)
  checkUserResponse(
    @Param('surveyId', ParseUUIDPipe) surveyId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.surveyResponseService.checkUserResponse(surveyId, userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyResponseService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.surveyResponseService.remove(id);
  }
}
