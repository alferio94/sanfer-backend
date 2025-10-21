import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { AppEvent } from 'src/event/entities/event.entity';
import { EventGroup } from 'src/event-group/entities/event-group.entity';
import { SurveyQuestion } from 'src/survey-question/entities/survey-question.entity';
import { In, Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { CreateSurveyWithQuestionsDto } from './dto/create-survey-with-questions.dto';
import { UpdateSurveyWithQuestionsDto } from './dto/update-survey-with-questions.dto';
import { QuestionType } from 'src/survey-question/entities/survey-question.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepo: Repository<Survey>,

    @InjectRepository(AppEvent)
    private readonly eventRepo: Repository<AppEvent>,

    @InjectRepository(EventGroup)
    private readonly groupRepo: Repository<EventGroup>,

    @InjectRepository(SurveyQuestion)
    private readonly questionRepo: Repository<SurveyQuestion>,
  ) {}

  async createWithQuestions(
    dto: CreateSurveyWithQuestionsDto,
  ): Promise<Survey> {
    try {
      // Verificar que el evento existe
      const event = await this.eventRepo.findOne({
        where: { id: dto.eventId },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }

      // Verificar que todos los grupos existen (solo si se proporcionaron grupos)
      let groups: EventGroup[] = [];
      if (dto.groupIds && dto.groupIds.length > 0) {
        groups = await this.groupRepo.find({
          where: { id: In(dto.groupIds) },
        });

        if (groups.length !== dto.groupIds.length) {
          const foundGroupIds = groups.map((group) => group.id);
          const missingGroupIds = dto.groupIds.filter(
            (id) => !foundGroupIds.includes(id),
          );
          throw new NotFoundException(
            `Groups with IDs ${missingGroupIds.join(', ')} not found`,
          );
        }
      }

      // Crear la encuesta
      const survey = this.surveyRepo.create({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        isActive: dto.isActive ?? true,
        event,
        groups,
      });

      const savedSurvey = await this.surveyRepo.save(survey);

      // Crear las preguntas
      const questions = dto.questions.map((questionDto, index) => {
        return this.questionRepo.create({
          questionText: questionDto.questionText,
          questionType: questionDto.questionType as QuestionType,
          isRequired: questionDto.isRequired ?? false,
          order: questionDto.order ?? index + 1,
          options: questionDto.options,
          survey: savedSurvey,
        });
      });

      await this.questionRepo.save(questions);

      // Retornar la encuesta completa con preguntas
      const result = await this.surveyRepo.findOne({
        where: { id: savedSurvey.id },
        relations: ['event', 'groups', 'questions'],
        order: { questions: { order: 'ASC' } },
      });
      if (!result) {
        throw new NotFoundException(
          `Survey with ID ${savedSurvey.id} not found`,
        );
      }

      return result;
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async updateWithQuestions(
    id: string,
    dto: UpdateSurveyWithQuestionsDto,
  ): Promise<Survey> {
    try {
      const survey = await this.surveyRepo.findOne({
        where: { id },
        relations: ['event', 'groups', 'questions'],
      });

      if (!survey) {
        throw new NotFoundException(`Survey with ID ${id} not found`);
      }

      // Si se proporcionan nuevos groupIds, verificar que existen
      if (dto.groupIds) {
        const groups = await this.groupRepo.find({
          where: { id: In(dto.groupIds) },
        });

        if (groups.length !== dto.groupIds.length) {
          const foundGroupIds = groups.map((group) => group.id);
          const missingGroupIds = dto.groupIds.filter(
            (id) => !foundGroupIds.includes(id),
          );
          throw new NotFoundException(
            `Groups with IDs ${missingGroupIds.join(', ')} not found`,
          );
        }

        survey.groups = groups;
      }

      // Actualizar campos de la encuesta
      if (dto.title !== undefined) {
        survey.title = dto.title;
      }

      if (dto.description !== undefined) {
        survey.description = dto.description;
      }

      if (dto.type !== undefined) {
        survey.type = dto.type;
      }

      if (dto.isActive !== undefined) {
        survey.isActive = dto.isActive;
      }

      await this.surveyRepo.save(survey);

      // Manejar preguntas si se proporcionan
      if (dto.questions) {
        // Obtener IDs de preguntas existentes que se van a actualizar
        const questionsToUpdate = dto.questions.filter((q) => q.id);
        const questionsToCreate = dto.questions.filter((q) => !q.id);
        const updatedQuestionIds = questionsToUpdate.map((q) => q.id);

        // Eliminar preguntas que no están en la nueva lista
        const questionsToDelete = survey.questions.filter(
          (existingQ) => !updatedQuestionIds.includes(existingQ.id),
        );

        if (questionsToDelete.length > 0) {
          await this.questionRepo.remove(questionsToDelete);
        }

        // Actualizar preguntas existentes
        for (const questionDto of questionsToUpdate) {
          const existingQuestion = survey.questions.find(
            (q) => q.id === questionDto.id,
          );
          if (existingQuestion) {
            existingQuestion.questionText = questionDto.questionText;
            existingQuestion.questionType =
              questionDto.questionType as QuestionType;
            existingQuestion.isRequired = questionDto.isRequired ?? false;
            existingQuestion.order =
              questionDto.order ?? existingQuestion.order;
            existingQuestion.options = questionDto.options;

            await this.questionRepo.save(existingQuestion);
          }
        }

        // Crear nuevas preguntas
        if (questionsToCreate.length > 0) {
          const newQuestions = questionsToCreate.map((questionDto, index) => {
            const maxOrder = Math.max(
              ...survey.questions.map((q) => q.order || 0),
              0,
            );
            return this.questionRepo.create({
              questionText: questionDto.questionText,
              questionType: questionDto.questionType as QuestionType,
              isRequired: questionDto.isRequired ?? false,
              order: questionDto.order ?? maxOrder + index + 1,
              options: questionDto.options,
              survey,
            });
          });

          await this.questionRepo.save(newQuestions);
        }
      }

      // Retornar la encuesta actualizada con preguntas
      const result = await this.surveyRepo.findOne({
        where: { id },
        relations: ['event', 'groups', 'questions'],
        order: { questions: { order: 'ASC' } },
      });
      if (!result) {
        throw new NotFoundException(`Survey with ID ${id} not found`);
      }

      return result;
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async create(dto: CreateSurveyDto): Promise<Survey> {
    try {
      // Verificar que el evento existe
      const event = await this.eventRepo.findOne({
        where: { id: dto.eventId },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
      }

      // Verificar que todos los grupos existen (solo si se proporcionaron grupos)
      let groups: EventGroup[] = [];
      if (dto.groupIds && dto.groupIds.length > 0) {
        groups = await this.groupRepo.find({
          where: { id: In(dto.groupIds) },
        });

        if (groups.length !== dto.groupIds.length) {
          const foundGroupIds = groups.map((group) => group.id);
          const missingGroupIds = dto.groupIds.filter(
            (id) => !foundGroupIds.includes(id),
          );
          throw new NotFoundException(
            `Groups with IDs ${missingGroupIds.join(', ')} not found`,
          );
        }
      }

      // Crear la encuesta
      const survey = this.surveyRepo.create({
        title: dto.title,
        description: dto.description,
        type: dto.type,
        isActive: dto.isActive ?? true,
        event,
        groups,
      });

      return await this.surveyRepo.save(survey);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async findAll(): Promise<Survey[]> {
    return await this.surveyRepo.find({
      relations: ['event', 'groups', 'questions'],
      order: { title: 'ASC' },
    });
  }

  async findByEventId(eventId: string): Promise<Survey[]> {
    // Verificar que el evento existe
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return await this.surveyRepo.find({
      where: { event: { id: eventId } },
      relations: ['event', 'groups', 'questions'],
      order: { type: 'ASC', title: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepo.findOne({
      where: { id },
      relations: ['event', 'groups', 'questions', 'responses'],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    return survey;
  }

  async findWithQuestions(id: string): Promise<Survey> {
    const survey = await this.surveyRepo.findOne({
      where: { id },
      relations: ['event', 'groups', 'questions'],
      order: { questions: { order: 'ASC' } },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    return survey;
  }

  async update(id: string, dto: UpdateSurveyDto): Promise<Survey> {
    try {
      const survey = await this.findOne(id);

      // Si se proporciona un nuevo eventId, verificar que existe
      if (dto.eventId && dto.eventId !== survey.event.id) {
        const event = await this.eventRepo.findOne({
          where: { id: dto.eventId },
        });

        if (!event) {
          throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
        }

        survey.event = event;
      }

      // Si se proporcionan nuevos groupIds, verificar que existen
      if (dto.groupIds) {
        const groups = await this.groupRepo.find({
          where: { id: In(dto.groupIds) },
        });

        if (groups.length !== dto.groupIds.length) {
          const foundGroupIds = groups.map((group) => group.id);
          const missingGroupIds = dto.groupIds.filter(
            (id) => !foundGroupIds.includes(id),
          );
          throw new NotFoundException(
            `Groups with IDs ${missingGroupIds.join(', ')} not found`,
          );
        }

        survey.groups = groups;
      }

      // Actualizar campos
      if (dto.title !== undefined) {
        survey.title = dto.title;
      }

      if (dto.description !== undefined) {
        survey.description = dto.description;
      }

      if (dto.type !== undefined) {
        survey.type = dto.type;
      }

      if (dto.isActive !== undefined) {
        survey.isActive = dto.isActive;
      }

      return await this.surveyRepo.save(survey);
    } catch (error) {
      handleDBError(error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.surveyRepo.remove(survey);
  }

  async getSurveyMetrics(id: string) {
    const survey = await this.surveyRepo
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.responses', 'responses')
      .leftJoinAndSelect('survey.questions', 'questions')
      .where('survey.id = :id', { id })
      .getOne();

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    const totalResponses = survey.responses?.length || 0;
    const totalQuestions = survey.questions?.length || 0;

    return {
      surveyId: id,
      title: survey.title,
      type: survey.type,
      totalResponses,
      totalQuestions,
      isActive: survey.isActive,
    };
  }
}
