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
import { CreateSurveyAnswerDto } from './dto/create-survey-answer.dto';
import { SurveyAnswerService } from './survey-answer.service';
import { UpdateSurveyAnswerDto } from './dto/update-survey-answer.dto';

@Controller('question-answer')
export class SurveyAnswerController {
  constructor(private readonly questionAnswerService: SurveyAnswerService) {}

  @Post()
  create(@Body() createQuestionAnswerDto: CreateSurveyAnswerDto) {
    return this.questionAnswerService.create(createQuestionAnswerDto);
  }

  @Get()
  findAll() {
    return this.questionAnswerService.findAll();
  }

  @Get('response/:responseId')
  findByResponseId(@Param('responseId', ParseUUIDPipe) responseId: string) {
    return this.questionAnswerService.findByResponseId(responseId);
  }

  @Get('question/:questionId')
  findByQuestionId(@Param('questionId', ParseUUIDPipe) questionId: string) {
    return this.questionAnswerService.findByQuestionId(questionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionAnswerService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionAnswerDto: UpdateSurveyAnswerDto,
  ) {
    return this.questionAnswerService.update(id, updateQuestionAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionAnswerService.remove(id);
  }
}
