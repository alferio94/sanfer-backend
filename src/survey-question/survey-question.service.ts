import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSurveyQuestionDto } from './dto/create-survey-question.dto';
import { UpdateSurveyQuestionDto } from './dto/update-survey-question.dto';
import { SurveyQuestion } from './entities/survey-question.entity';
import { Survey } from 'src/survey/entities/survey.entity';
import { handleDBError } from 'src/common/utils/dbError.utils';

@Injectable()
export class SurveyQuestionService {
  constructor(
    @InjectRepository(SurveyQuestion)
    private readonly questionRepo: Repository<SurveyQuestion>,

    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,
  ) {}

  async create(dto: CreateSurveyQuestionDto): Promise<SurveyQuestion> {
    try {
      // Verificar que la encuesta existe
      const survey = await this.surveyRepo.findOne({
        where: { id: dto.surveyId },
      });

      if (!survey) {
        throw new NotFoundException(`Survey with ID ${dto.surveyId} not found`);
      }

      // Crear la pregunta
      const question = this.questionRepo.create({
        questionText: dto.questionText,
        questionType: dto.questionType,
        isRequired: dto.isRequired ?? false,
        order: dto.order ?? 1,
        options: dto.options,
        survey,
      });

      return await this.questionRepo.save(question);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<SurveyQuestion[]> {
    return await this.questionRepo.find({
      relations: ['survey'],
      order: { order: 'ASC' },
    });
  }

  async findBySurveyId(surveyId: string): Promise<SurveyQuestion[]> {
    // Verificar que la encuesta existe
    const survey = await this.surveyRepo.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${surveyId} not found`);
    }

    return await this.questionRepo.find({
      where: { survey: { id: surveyId } },
      relations: ['survey'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SurveyQuestion> {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['survey'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async update(
    id: string,
    dto: UpdateSurveyQuestionDto,
  ): Promise<SurveyQuestion> {
    try {
      const question = await this.findOne(id);

      // Si se proporciona un nuevo surveyId, verificar que existe
      if (dto.surveyId && dto.surveyId !== question.survey.id) {
        const survey = await this.surveyRepo.findOne({
          where: { id: dto.surveyId },
        });

        if (!survey) {
          throw new NotFoundException(
            `Survey with ID ${dto.surveyId} not found`,
          );
        }

        question.survey = survey;
      }

      // Actualizar campos
      if (dto.questionText !== undefined) {
        question.questionText = dto.questionText;
      }

      if (dto.questionType !== undefined) {
        question.questionType = dto.questionType;
      }

      if (dto.isRequired !== undefined) {
        question.isRequired = dto.isRequired;
      }

      if (dto.order !== undefined) {
        question.order = dto.order;
      }

      if (dto.options !== undefined) {
        question.options = dto.options;
      }

      return await this.questionRepo.save(question);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    await this.questionRepo.remove(question);
  }
}
