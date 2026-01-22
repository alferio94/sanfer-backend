/**
 * DTOs for Survey Report responses
 * These are response types, not validation DTOs
 */

// ============================================
// QUESTION STATISTICS TYPES
// ============================================

export interface RatingStats {
  average: number;
  min: number;
  max: number;
  distribution: Record<number, number>; // { 1: 5, 2: 10, 3: 20, ... }
}

export interface MultipleChoiceStats {
  distribution: Record<
    string,
    {
      count: number;
      percentage: number;
    }
  >;
}

export interface BooleanStats {
  yes: { count: number; percentage: number };
  no: { count: number; percentage: number };
}

export interface TextStats {
  responses: string[]; // Raw text responses
  totalResponses: number;
}

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  order: number;
  options?: string[]; // Only for multiple_choice
  totalAnswers: number;
  stats: RatingStats | MultipleChoiceStats | BooleanStats | TextStats;
}

// ============================================
// SURVEY REPORT RESPONSE
// ============================================

export interface SurveyReportSummary {
  totalResponses: number;
  totalQuestions: number;
  completionRate: number; // percentage of assigned users who completed
  averageRating: number | null; // global average of all rating questions
}

export interface SurveyReportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    isActive: boolean;
    eventId: string;
    eventName: string;
  };
  summary: SurveyReportSummary;
  questionStats: QuestionStatistics[];
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}

// ============================================
// RESPONDENTS LIST RESPONSE
// ============================================

export interface RespondentInfo {
  id: string;
  name: string;
  email: string;
  submittedAt: Date;
  groups: { id: string; name: string; color: string }[];
}

export interface SurveyRespondentsResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: string;
  totalRespondents: number;
  respondents: RespondentInfo[];
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}

// ============================================
// COMPLETION RATE RESPONSE
// ============================================

export interface CompletionRateResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: string;
  totalAssigned: number; // users in targeted groups
  totalCompleted: number; // users who submitted
  completionRate: number; // percentage
  pending: number; // users who haven't completed
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}

// ============================================
// EXPORT RESPONSE (for Excel generation in frontend)
// ============================================

export interface ExportAnswerData {
  respondentId: string;
  respondentName: string;
  respondentEmail: string;
  submittedAt: Date;
  groups: string[]; // group names
  answers: {
    questionId: string;
    questionText: string;
    questionType: string;
    answer: string | number | boolean | null;
  }[];
}

export interface SurveyExportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    eventName: string;
    exportedAt: Date;
  };
  questions: {
    id: string;
    text: string;
    type: string;
    order: number;
    options?: string[];
  }[];
  data: ExportAnswerData[];
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}
