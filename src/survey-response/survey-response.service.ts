import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSurveyResponseDto } from './dto/create-survey-response.dto';
import { SubmitSurveyResponseDto } from './dto/submit-survey-response.dto';
import { SurveyResponse } from './entities/survey-response.entity';
import { Survey } from 'src/survey/entities/survey.entity';
import { EventUser } from 'src/event-user/entities/event-user.entity';
import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { SurveyAnswer } from 'src/survey-answer/entities/survey-answer.entity';

@Injectable()
export class SurveyResponseService {
  constructor(
    @InjectRepository(SurveyResponse)
    private readonly responseRepo: Repository<SurveyResponse>,

    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,

    @InjectRepository(EventUser)
    private readonly userRepo: Repository<EventUser>,

    @InjectRepository(SurveyAnswer)
    private readonly answerRepo: Repository<SurveyAnswer>,

    @InjectRepository(SurveyQuestion)
    private readonly questionRepo: Repository<SurveyQuestion>,
  ) {}

  async submitSurveyResponse(
    dto: SubmitSurveyResponseDto,
  ): Promise<SurveyResponse> {
    try {
      // Verificar que la encuesta existe
      const survey = await this.surveyRepo.findOne({
        where: { id: dto.surveyId },
        relations: ['questions'],
      });

      if (!survey) {
        throw new NotFoundException(`Survey with ID ${dto.surveyId} not found`);
      }

      // Verificar que el usuario existe
      const user = await this.userRepo.findOne({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${dto.userId} not found`);
      }

      // Verificar que el usuario no haya respondido ya esta encuesta
      const existingResponse = await this.responseRepo.findOne({
        where: {
          survey: { id: dto.surveyId },
          user: { id: dto.userId },
        },
      });

      if (existingResponse) {
        throw new BadRequestException(
          'User has already responded to this survey',
        );
      }

      // Crear la respuesta principal
      const surveyResponse = this.responseRepo.create({
        survey,
        user,
      });

      const savedResponse = await this.responseRepo.save(surveyResponse);

      // Crear las respuestas individuales
      const questionAnswers: SurveyAnswer[] = [];
      for (const answerDto of dto.answers) {
        const question = await this.questionRepo.findOne({
          where: { id: answerDto.questionId },
        });

        if (!question) {
          throw new NotFoundException(
            `Question with ID ${answerDto.questionId} not found`,
          );
        }

        const questionAnswer = this.answerRepo.create({
          answerValue: answerDto.answerValue,
          selectedOption: answerDto.selectedOption,
          ratingValue: answerDto.ratingValue,
          booleanValue: answerDto.booleanValue,
          surveyResponse: savedResponse,
          question,
        });

        questionAnswers.push(questionAnswer);
      }

      await this.answerRepo.save(questionAnswers);

      // Retornar la respuesta completa con las respuestas individuales
      const result = await this.responseRepo.findOne({
        where: { id: savedResponse.id },
        relations: ['survey', 'user', 'answers', 'answers.question'],
      });
      if (!result) {
        throw new NotFoundException(
          `Survey response with ID ${savedResponse.id} not found`,
        );
      }
      return result;
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async create(createSurveyResponseDto: CreateSurveyResponseDto) {
    return await this.responseRepo.save(createSurveyResponseDto);
  }

  async findAll(): Promise<SurveyResponse[]> {
    return await this.responseRepo.find({
      relations: ['survey', 'user', 'answers'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findBySurveyId(surveyId: string): Promise<SurveyResponse[]> {
    const survey = await this.surveyRepo.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    return await this.responseRepo.find({
      where: { survey: { id: surveyId } },
      relations: ['survey', 'user', 'answers', 'answers.question'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<SurveyResponse[]> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.responseRepo.find({
      where: { user: { id: userId } },
      relations: ['survey', 'user', 'answers', 'answers.question'],
      order: { submittedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SurveyResponse> {
    const response = await this.responseRepo.findOne({
      where: { id },
      relations: ['survey', 'user', 'answers', 'answers.question'],
    });

    if (!response) {
      throw new NotFoundException(`Survey response with ID ${id} not found`);
    }

    return response;
  }

  async checkUserResponse(surveyId: string, userId: string): Promise<boolean> {
    const response = await this.responseRepo.findOne({
      where: {
        survey: { id: surveyId },
        user: { id: userId },
      },
    });

    return !!response;
  }

  async remove(id: string): Promise<void> {
    const response = await this.findOne(id);
    await this.responseRepo.remove(response);
  }
}
