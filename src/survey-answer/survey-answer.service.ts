import { Injectable, NotFoundException } from '@nestjs/common';
import { SurveyAnswer } from './entities/survey-answer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { SurveyResponse } from 'src/survey-response/entities/survey-response.entity';
import { Repository } from 'typeorm';
import { CreateSurveyAnswerDto } from './dto/create-survey-answer.dto';
import { UpdateSurveyAnswerDto } from './dto/update-survey-answer.dto';

@Injectable()
export class SurveyAnswerService {
  constructor(
    @InjectRepository(SurveyAnswer)
    private readonly answerRepo: Repository<SurveyAnswer>,

    @InjectRepository(SurveyResponse)
    private readonly responseRepo: Repository<SurveyResponse>,

    @InjectRepository(SurveyQuestion)
    private readonly questionRepo: Repository<SurveyQuestion>,
  ) {}

  async create(dto: CreateSurveyAnswerDto): Promise<SurveyAnswer> {
    try {
      // Verificar que la respuesta existe
      const surveyResponse = await this.responseRepo.findOne({
        where: { id: dto.surveyResponseId },
      });

      if (!surveyResponse) {
        throw new NotFoundException(
          `Survey response with ID ${dto.surveyResponseId} not found`,
        );
      }

      // Verificar que la pregunta existe
      const question = await this.questionRepo.findOne({
        where: { id: dto.questionId },
      });

      if (!question) {
        throw new NotFoundException(
          `Question with ID ${dto.questionId} not found`,
        );
      }

      // Crear la respuesta
      const answer = this.answerRepo.create({
        answerValue: dto.answerValue,
        selectedOption: dto.selectedOption,
        ratingValue: dto.ratingValue,
        booleanValue: dto.booleanValue,
        surveyResponse,
        question,
      });

      return await this.answerRepo.save(answer);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<SurveyAnswer[]> {
    return await this.answerRepo.find({
      relations: ['surveyResponse', 'question'],
    });
  }

  async findByResponseId(responseId: string): Promise<SurveyAnswer[]> {
    const response = await this.responseRepo.findOne({
      where: { id: responseId },
    });

    if (!response) {
      throw new NotFoundException(
        `Survey response with ID ${responseId} not found`,
      );
    }

    return await this.answerRepo.find({
      where: { surveyResponse: { id: responseId } },
      relations: ['surveyResponse', 'question'],
      order: { question: { order: 'ASC' } },
    });
  }

  async findByQuestionId(questionId: string): Promise<SurveyAnswer[]> {
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    return await this.answerRepo.find({
      where: { question: { id: questionId } },
      relations: ['surveyResponse', 'question'],
    });
  }

  async findOne(id: string): Promise<SurveyAnswer> {
    const answer = await this.answerRepo.findOne({
      where: { id },
      relations: ['surveyResponse', 'question'],
    });

    if (!answer) {
      throw new NotFoundException(`Question answer with ID ${id} not found`);
    }

    return answer;
  }

  async update(id: string, dto: UpdateSurveyAnswerDto): Promise<SurveyAnswer> {
    try {
      const answer = await this.findOne(id);

      // Actualizar campos
      if (dto.answerValue !== undefined) {
        answer.answerValue = dto.answerValue;
      }

      if (dto.selectedOption !== undefined) {
        answer.selectedOption = dto.selectedOption;
      }

      if (dto.ratingValue !== undefined) {
        answer.ratingValue = dto.ratingValue;
      }

      if (dto.booleanValue !== undefined) {
        answer.booleanValue = dto.booleanValue;
      }

      return await this.answerRepo.save(answer);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const answer = await this.findOne(id);
    await this.answerRepo.remove(answer);
  }
}
