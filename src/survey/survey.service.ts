import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { handleDBError } from 'src/common/utils/dbError.utils';
import { AppEvent } from 'src/event/entities/event.entity';
import { EventGroup } from 'src/event-group/entities/event-group.entity';
import {
  SurveyQuestion,
  QuestionType,
} from 'src/survey-question/entities/survey-question.entity';
import { In, Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { CreateSurveyWithQuestionsDto } from './dto/create-survey-with-questions.dto';
import { UpdateSurveyWithQuestionsDto } from './dto/update-survey-with-questions.dto';
import { SurveyResponse } from 'src/survey-response/entities/survey-response.entity';
import { SurveyAnswer } from 'src/survey-answer/entities/survey-answer.entity';
import { EventUserAssignment } from 'src/event/entities/event-user-assignment.entity';
import {
  SurveyReportResponse,
  QuestionStatistics,
  RatingStats,
  MultipleChoiceStats,
  BooleanStats,
  TextStats,
  SurveyRespondentsResponse,
  CompletionRateResponse,
  SurveyExportResponse,
} from './dto/survey-report.dto';

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

    @InjectRepository(SurveyResponse)
    private readonly responseRepo: Repository<SurveyResponse>,

    @InjectRepository(SurveyAnswer)
    private readonly answerRepo: Repository<SurveyAnswer>,

    @InjectRepository(EventUserAssignment)
    private readonly assignmentRepo: Repository<EventUserAssignment>,
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

  async findByGroupId(groupId: string): Promise<Survey[]> {
    // Verificar que el grupo existe
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    return await this.surveyRepo
      .createQueryBuilder('survey')
      .leftJoinAndSelect('survey.event', 'event')
      .leftJoinAndSelect('survey.groups', 'groups')
      .leftJoinAndSelect('survey.questions', 'questions')
      .where('groups.id = :groupId', { groupId })
      .orderBy('survey.type', 'ASC')
      .addOrderBy('survey.title', 'ASC')
      .addOrderBy('questions.order', 'ASC')
      .getMany();
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

  // ============================================
  // REPORTING METHODS
  // ============================================

  /**
   * Get detailed survey report with statistics per question
   * @param id Survey ID
   * @param groupId Optional group filter
   */
  async getSurveyReport(
    id: string,
    groupId?: string,
  ): Promise<SurveyReportResponse> {
    // Get survey with all relations
    const survey = await this.surveyRepo.findOne({
      where: { id },
      relations: ['event', 'groups', 'questions'],
      order: { questions: { order: 'ASC' } },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    // Validate group if provided
    let filterGroup: EventGroup | null = null;
    if (groupId) {
      filterGroup = await this.groupRepo.findOne({ where: { id: groupId } });
      if (!filterGroup) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }
    }

    // Get responses with user and their group assignments
    const responsesQuery = this.responseRepo
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.user', 'user')
      .leftJoinAndSelect('response.answers', 'answers')
      .leftJoinAndSelect('answers.question', 'question')
      .leftJoin(
        'event_user_assignments',
        'assignment',
        'assignment.userId = user.id AND assignment.eventId = :eventId',
        { eventId: survey.event.id },
      )
      .leftJoin('assignment_groups', 'ag', 'ag.assignment_id = assignment.id')
      .where('response.surveyId = :surveyId', { surveyId: id });

    // Filter by group if specified
    if (groupId) {
      responsesQuery.andWhere('ag.group_id = :groupId', { groupId });
    }

    const responses = await responsesQuery.getMany();

    // Calculate completion rate
    const { totalAssigned } = await this.getAssignedUsersCount(
      survey.event.id,
      survey.groups.map((g) => g.id),
      groupId,
    );
    const completionRate =
      totalAssigned > 0 ? (responses.length / totalAssigned) * 100 : 0;

    // Calculate statistics per question
    const questionStats: QuestionStatistics[] = [];
    let totalRatingSum = 0;
    let totalRatingCount = 0;

    for (const question of survey.questions) {
      // Get all answers for this question from the responses
      const questionAnswers = responses.flatMap((r) =>
        r.answers.filter((a) => a.question?.id === question.id),
      );

      const stats = this.calculateQuestionStats(question, questionAnswers);

      // Accumulate for global rating average
      if (question.questionType === QuestionType.RATING && stats) {
        const ratingStats = stats as RatingStats;
        totalRatingSum += ratingStats.average * questionAnswers.length;
        totalRatingCount += questionAnswers.length;
      }

      questionStats.push({
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        isRequired: question.isRequired,
        order: question.order,
        options: question.options,
        totalAnswers: questionAnswers.length,
        stats,
      });
    }

    const averageRating =
      totalRatingCount > 0 ? totalRatingSum / totalRatingCount : null;

    return {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description ?? null,
        type: survey.type,
        isActive: survey.isActive,
        eventId: survey.event.id,
        eventName: survey.event.name,
      },
      summary: {
        totalResponses: responses.length,
        totalQuestions: survey.questions.length,
        completionRate: Math.round(completionRate * 100) / 100,
        averageRating: averageRating
          ? Math.round(averageRating * 100) / 100
          : null,
      },
      questionStats,
      filters: {
        groupId: groupId || null,
        groupName: filterGroup?.name || null,
      },
    };
  }

  /**
   * Get list of users who responded to the survey
   */
  async getSurveyRespondents(
    id: string,
    groupId?: string,
  ): Promise<SurveyRespondentsResponse> {
    const survey = await this.surveyRepo.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    // Validate group if provided
    let filterGroup: EventGroup | null = null;
    if (groupId) {
      filterGroup = await this.groupRepo.findOne({ where: { id: groupId } });
      if (!filterGroup) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }
    }

    // Build query for responses with user data
    const responsesQuery = this.responseRepo
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.user', 'user')
      .leftJoin(
        'event_user_assignments',
        'assignment',
        'assignment.userId = user.id AND assignment.eventId = :eventId',
        { eventId: survey.event.id },
      )
      .leftJoin('assignment_groups', 'ag', 'ag.assignment_id = assignment.id')
      .where('response.surveyId = :surveyId', { surveyId: id });

    if (groupId) {
      responsesQuery.andWhere('ag.group_id = :groupId', { groupId });
    }

    responsesQuery.orderBy('response.submittedAt', 'DESC');

    const responses = await responsesQuery.getMany();

    // Get group info for each respondent
    const respondents = await Promise.all(
      responses.map(async (response) => {
        const assignment = await this.assignmentRepo.findOne({
          where: {
            user: { id: response.user.id },
            event: { id: survey.event.id },
          },
          relations: ['groups'],
        });

        return {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          submittedAt: response.submittedAt,
          groups:
            assignment?.groups.map((g) => ({
              id: g.id,
              name: g.name,
              color: g.color,
            })) || [],
        };
      }),
    );

    return {
      surveyId: survey.id,
      surveyTitle: survey.title,
      surveyType: survey.type,
      totalRespondents: respondents.length,
      respondents,
      filters: {
        groupId: groupId || null,
        groupName: filterGroup?.name || null,
      },
    };
  }

  /**
   * Get completion rate for a survey
   */
  async getCompletionRate(
    id: string,
    groupId?: string,
  ): Promise<CompletionRateResponse> {
    const survey = await this.surveyRepo.findOne({
      where: { id },
      relations: ['event', 'groups'],
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    // Validate group if provided
    let filterGroup: EventGroup | null = null;
    if (groupId) {
      filterGroup = await this.groupRepo.findOne({ where: { id: groupId } });
      if (!filterGroup) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }
    }

    // Get assigned users count
    const { totalAssigned } = await this.getAssignedUsersCount(
      survey.event.id,
      survey.groups.map((g) => g.id),
      groupId,
    );

    // Get completed responses count
    const completedQuery = this.responseRepo
      .createQueryBuilder('response')
      .leftJoin('response.user', 'user')
      .leftJoin(
        'event_user_assignments',
        'assignment',
        'assignment.userId = user.id AND assignment.eventId = :eventId',
        { eventId: survey.event.id },
      )
      .leftJoin('assignment_groups', 'ag', 'ag.assignment_id = assignment.id')
      .where('response.surveyId = :surveyId', { surveyId: id });

    if (groupId) {
      completedQuery.andWhere('ag.group_id = :groupId', { groupId });
    }

    const totalCompleted = await completedQuery.getCount();

    const completionRate =
      totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

    return {
      surveyId: survey.id,
      surveyTitle: survey.title,
      surveyType: survey.type,
      totalAssigned,
      totalCompleted,
      completionRate: Math.round(completionRate * 100) / 100,
      pending: totalAssigned - totalCompleted,
      filters: {
        groupId: groupId || null,
        groupName: filterGroup?.name || null,
      },
    };
  }

  /**
   * Export survey data in a structured format for Excel generation
   */
  async exportSurvey(
    id: string,
    groupId?: string,
  ): Promise<SurveyExportResponse> {
    const survey = await this.surveyRepo.findOne({
      where: { id },
      relations: ['event', 'questions'],
      order: { questions: { order: 'ASC' } },
    });

    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }

    // Validate group if provided
    let filterGroup: EventGroup | null = null;
    if (groupId) {
      filterGroup = await this.groupRepo.findOne({ where: { id: groupId } });
      if (!filterGroup) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }
    }

    // Get all responses with answers
    const responsesQuery = this.responseRepo
      .createQueryBuilder('response')
      .leftJoinAndSelect('response.user', 'user')
      .leftJoinAndSelect('response.answers', 'answers')
      .leftJoinAndSelect('answers.question', 'question')
      .leftJoin(
        'event_user_assignments',
        'assignment',
        'assignment.userId = user.id AND assignment.eventId = :eventId',
        { eventId: survey.event.id },
      )
      .leftJoin('assignment_groups', 'ag', 'ag.assignment_id = assignment.id')
      .where('response.surveyId = :surveyId', { surveyId: id });

    if (groupId) {
      responsesQuery.andWhere('ag.group_id = :groupId', { groupId });
    }

    responsesQuery.orderBy('response.submittedAt', 'DESC');

    const responses = await responsesQuery.getMany();

    // Build export data
    const data = await Promise.all(
      responses.map(async (response) => {
        // Get user's groups
        const assignment = await this.assignmentRepo.findOne({
          where: {
            user: { id: response.user.id },
            event: { id: survey.event.id },
          },
          relations: ['groups'],
        });

        // Build answers array matching question order
        const answers = survey.questions.map((question) => {
          const answer = response.answers.find(
            (a) => a.question?.id === question.id,
          );

          let answerValue: string | number | boolean | null = null;
          if (answer) {
            switch (question.questionType) {
              case QuestionType.TEXT:
                answerValue = answer.answerValue || null;
                break;
              case QuestionType.MULTIPLE_CHOICE:
                answerValue = answer.selectedOption || null;
                break;
              case QuestionType.RATING:
                answerValue = answer.ratingValue ?? null;
                break;
              case QuestionType.BOOLEAN:
                answerValue = answer.booleanValue ?? null;
                break;
            }
          }

          return {
            questionId: question.id,
            questionText: question.questionText,
            questionType: question.questionType,
            answer: answerValue,
          };
        });

        return {
          respondentId: response.user.id,
          respondentName: response.user.name,
          respondentEmail: response.user.email,
          submittedAt: response.submittedAt,
          groups: assignment?.groups.map((g) => g.name) || [],
          answers,
        };
      }),
    );

    return {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description ?? null,
        type: survey.type,
        eventName: survey.event.name,
        exportedAt: new Date(),
      },
      questions: survey.questions.map((q) => ({
        id: q.id,
        text: q.questionText,
        type: q.questionType,
        order: q.order,
        options: q.options,
      })),
      data,
      filters: {
        groupId: groupId || null,
        groupName: filterGroup?.name || null,
      },
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Get count of users assigned to the survey's target groups
   */
  private async getAssignedUsersCount(
    eventId: string,
    surveyGroupIds: string[],
    filterGroupId?: string,
  ): Promise<{ totalAssigned: number }> {
    // If survey has no groups, it's for all event users
    if (surveyGroupIds.length === 0) {
      const query = this.assignmentRepo
        .createQueryBuilder('assignment')
        .where('assignment.eventId = :eventId', { eventId });

      if (filterGroupId) {
        query
          .leftJoin(
            'assignment_groups',
            'ag',
            'ag.assignment_id = assignment.id',
          )
          .andWhere('ag.group_id = :filterGroupId', { filterGroupId });
      }

      const count = await query.getCount();
      return { totalAssigned: count };
    }

    // Survey is targeted to specific groups
    const targetGroupIds = filterGroupId ? [filterGroupId] : surveyGroupIds;

    const query = this.assignmentRepo
      .createQueryBuilder('assignment')
      .leftJoin('assignment_groups', 'ag', 'ag.assignment_id = assignment.id')
      .where('assignment.eventId = :eventId', { eventId })
      .andWhere('ag.group_id IN (:...targetGroupIds)', { targetGroupIds })
      .select('COUNT(DISTINCT assignment.id)', 'count');

    const result = await query.getRawOne();
    return { totalAssigned: parseInt(result.count, 10) || 0 };
  }

  /**
   * Calculate statistics based on question type
   */
  private calculateQuestionStats(
    question: SurveyQuestion,
    answers: SurveyAnswer[],
  ): RatingStats | MultipleChoiceStats | BooleanStats | TextStats {
    switch (question.questionType) {
      case QuestionType.RATING:
        return this.calculateRatingStats(answers);

      case QuestionType.MULTIPLE_CHOICE:
        return this.calculateMultipleChoiceStats(answers, question.options);

      case QuestionType.BOOLEAN:
        return this.calculateBooleanStats(answers);

      case QuestionType.TEXT:
      default:
        return this.calculateTextStats(answers);
    }
  }

  private calculateRatingStats(answers: SurveyAnswer[]): RatingStats {
    const ratings = answers
      .map((a) => a.ratingValue)
      .filter((r): r is number => r !== null && r !== undefined);

    if (ratings.length === 0) {
      return { average: 0, min: 0, max: 0, distribution: {} };
    }

    const sum = ratings.reduce((acc, r) => acc + r, 0);
    const distribution: Record<number, number> = {};

    ratings.forEach((rating) => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });

    return {
      average: Math.round((sum / ratings.length) * 100) / 100,
      min: Math.min(...ratings),
      max: Math.max(...ratings),
      distribution,
    };
  }

  private calculateMultipleChoiceStats(
    answers: SurveyAnswer[],
    options?: string[],
  ): MultipleChoiceStats {
    const distribution: Record<string, { count: number; percentage: number }> =
      {};
    const total = answers.length;

    // Initialize all options with 0
    if (options) {
      options.forEach((opt) => {
        distribution[opt] = { count: 0, percentage: 0 };
      });
    }

    // Count selections
    answers.forEach((answer) => {
      if (answer.selectedOption) {
        if (!distribution[answer.selectedOption]) {
          distribution[answer.selectedOption] = { count: 0, percentage: 0 };
        }
        distribution[answer.selectedOption].count += 1;
      }
    });

    // Calculate percentages
    Object.keys(distribution).forEach((key) => {
      distribution[key].percentage =
        total > 0
          ? Math.round((distribution[key].count / total) * 10000) / 100
          : 0;
    });

    return { distribution };
  }

  private calculateBooleanStats(answers: SurveyAnswer[]): BooleanStats {
    const total = answers.length;
    let yesCount = 0;
    let noCount = 0;

    answers.forEach((answer) => {
      if (answer.booleanValue === true) yesCount++;
      else if (answer.booleanValue === false) noCount++;
    });

    return {
      yes: {
        count: yesCount,
        percentage:
          total > 0 ? Math.round((yesCount / total) * 10000) / 100 : 0,
      },
      no: {
        count: noCount,
        percentage: total > 0 ? Math.round((noCount / total) * 10000) / 100 : 0,
      },
    };
  }

  private calculateTextStats(answers: SurveyAnswer[]): TextStats {
    const responses = answers
      .map((a) => a.answerValue)
      .filter((r): r is string => r !== null && r !== undefined && r !== '');

    return {
      responses,
      totalResponses: responses.length,
    };
  }
}
