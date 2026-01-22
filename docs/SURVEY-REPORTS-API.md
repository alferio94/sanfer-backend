# Survey Reports API - Frontend Integration Guide

## Overview

This document describes the Survey Reports API endpoints for building the reporting dashboard in the frontend application. These endpoints provide statistics, respondent lists, completion rates, and exportable data for survey analysis.

**Base URL:** `/api/survey`

**Authentication:** Currently public (no auth required for dashboard operations)

---

## Endpoints Summary

| Endpoint               | Method | Description                  | Use Case                     |
| ---------------------- | ------ | ---------------------------- | ---------------------------- |
| `/:id/report`          | GET    | Full statistics per question | Charts & Analytics Dashboard |
| `/:id/respondents`     | GET    | List of users who completed  | Participants Table           |
| `/:id/completion-rate` | GET    | Completion metrics           | KPI Cards                    |
| `/:id/export`          | GET    | Structured data for Excel    | Export Button                |

**All endpoints support filtering by group:** Add `?groupId=<uuid>` query parameter.

---

## 1. Survey Report (Statistics)

### Endpoint

```
GET /api/survey/:surveyId/report
GET /api/survey/:surveyId/report?groupId=<groupId>
```

### Description

Returns comprehensive statistics for each question in the survey. Use this for building charts and analytics dashboards.

### Request

```typescript
// Path Parameters
surveyId: string; // UUID of the survey

// Query Parameters (optional)
groupId?: string; // UUID - Filter results to specific group
```

### Response

```typescript
interface SurveyReportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: 'entry' | 'exit';
    isActive: boolean;
    eventId: string;
    eventName: string;
  };
  summary: {
    totalResponses: number; // Total users who completed the survey
    totalQuestions: number; // Number of questions in survey
    completionRate: number; // Percentage (0-100) of assigned users who completed
    averageRating: number | null; // Global average of all rating questions (null if no rating questions)
  };
  questionStats: QuestionStatistics[];
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}

interface QuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  isRequired: boolean;
  order: number;
  options?: string[]; // Only present for multiple_choice questions
  totalAnswers: number;
  stats: RatingStats | MultipleChoiceStats | BooleanStats | TextStats;
}
```

### Stats by Question Type

#### Rating Questions

```typescript
interface RatingStats {
  average: number;           // e.g., 4.25
  min: number;               // e.g., 1
  max: number;               // e.g., 5
  distribution: {            // Count per rating value
    [rating: number]: number;
  };
}

// Example:
{
  "average": 4.25,
  "min": 1,
  "max": 5,
  "distribution": {
    "1": 5,
    "2": 10,
    "3": 25,
    "4": 45,
    "5": 42
  }
}
```

**Chart Recommendation:** Bar chart or histogram for distribution, gauge for average.

#### Multiple Choice Questions

```typescript
interface MultipleChoiceStats {
  distribution: {
    [option: string]: {
      count: number;
      percentage: number;    // 0-100
    };
  };
}

// Example:
{
  "distribution": {
    "Excelente": { "count": 60, "percentage": 47.24 },
    "Buena": { "count": 40, "percentage": 31.5 },
    "Regular": { "count": 20, "percentage": 15.75 },
    "Mala": { "count": 7, "percentage": 5.51 }
  }
}
```

**Chart Recommendation:** Pie chart, donut chart, or horizontal bar chart.

#### Boolean Questions

```typescript
interface BooleanStats {
  yes: { count: number; percentage: number };
  no: { count: number; percentage: number };
}

// Example:
{
  "yes": { "count": 110, "percentage": 86.61 },
  "no": { "count": 17, "percentage": 13.39 }
}
```

**Chart Recommendation:** Pie chart, donut chart, or simple yes/no progress bars.

#### Text Questions

```typescript
interface TextStats {
  responses: string[];       // Array of all text responses
  totalResponses: number;
}

// Example:
{
  "responses": [
    "El evento estuvo muy bien organizado",
    "Me gustaron las conferencias",
    "Excelente networking"
  ],
  "totalResponses": 3
}
```

**UI Recommendation:** Scrollable list or card-based layout showing individual responses.

### Example Response

```json
{
  "survey": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Encuesta de Satisfaccion - Evento 2026",
    "description": "Encuesta para medir la satisfaccion de los asistentes",
    "type": "exit",
    "isActive": true,
    "eventId": "event-uuid-here",
    "eventName": "Congreso Anual Sanfer 2026"
  },
  "summary": {
    "totalResponses": 127,
    "totalQuestions": 5,
    "completionRate": 84.67,
    "averageRating": 4.25
  },
  "questionStats": [
    {
      "questionId": "q1-uuid",
      "questionText": "¿Como calificarias el evento en general?",
      "questionType": "rating",
      "isRequired": true,
      "order": 1,
      "totalAnswers": 127,
      "stats": {
        "average": 4.35,
        "min": 2,
        "max": 5,
        "distribution": { "2": 3, "3": 15, "4": 45, "5": 64 }
      }
    },
    {
      "questionId": "q2-uuid",
      "questionText": "¿Que te parecio la comida?",
      "questionType": "multiple_choice",
      "isRequired": true,
      "order": 2,
      "options": ["Excelente", "Buena", "Regular", "Mala"],
      "totalAnswers": 125,
      "stats": {
        "distribution": {
          "Excelente": { "count": 60, "percentage": 48 },
          "Buena": { "count": 40, "percentage": 32 },
          "Regular": { "count": 20, "percentage": 16 },
          "Mala": { "count": 5, "percentage": 4 }
        }
      }
    },
    {
      "questionId": "q3-uuid",
      "questionText": "¿Recomendarias este evento a un colega?",
      "questionType": "boolean",
      "isRequired": true,
      "order": 3,
      "totalAnswers": 127,
      "stats": {
        "yes": { "count": 115, "percentage": 90.55 },
        "no": { "count": 12, "percentage": 9.45 }
      }
    },
    {
      "questionId": "q4-uuid",
      "questionText": "¿Que mejorarias para el proximo evento?",
      "questionType": "text",
      "isRequired": false,
      "order": 4,
      "totalAnswers": 85,
      "stats": {
        "responses": [
          "Mas tiempo para networking",
          "Mejorar el aire acondicionado",
          "Mas opciones vegetarianas en la comida"
        ],
        "totalResponses": 85
      }
    }
  ],
  "filters": {
    "groupId": null,
    "groupName": null
  }
}
```

---

## 2. Survey Respondents

### Endpoint

```
GET /api/survey/:surveyId/respondents
GET /api/survey/:surveyId/respondents?groupId=<groupId>
```

### Description

Returns a list of users who completed the survey. Does NOT include their specific answers - only participant metadata. Use this for displaying a participants table.

### Request

```typescript
// Path Parameters
surveyId: string;

// Query Parameters (optional)
groupId?: string; // Filter by group
```

### Response

```typescript
interface SurveyRespondentsResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: 'entry' | 'exit';
  totalRespondents: number;
  respondents: RespondentInfo[];
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}

interface RespondentInfo {
  id: string; // User ID
  name: string; // User's full name
  email: string; // User's email
  submittedAt: Date; // ISO 8601 timestamp
  groups: {
    // Groups the user belongs to
    id: string;
    name: string;
    color: string; // Hex color for badges/tags
  }[];
}
```

### Example Response

```json
{
  "surveyId": "survey-uuid",
  "surveyTitle": "Encuesta de Satisfaccion",
  "surveyType": "exit",
  "totalRespondents": 127,
  "respondents": [
    {
      "id": "user-1-uuid",
      "name": "Juan Perez",
      "email": "juan.perez@empresa.com",
      "submittedAt": "2026-01-20T14:30:00.000Z",
      "groups": [
        { "id": "group-1", "name": "VIP", "color": "#FF5733" },
        { "id": "group-2", "name": "Mesa 5", "color": "#33FF57" }
      ]
    },
    {
      "id": "user-2-uuid",
      "name": "Maria Garcia",
      "email": "maria.garcia@empresa.com",
      "submittedAt": "2026-01-20T15:45:00.000Z",
      "groups": [{ "id": "group-3", "name": "General", "color": "#3357FF" }]
    }
  ],
  "filters": {
    "groupId": null,
    "groupName": null
  }
}
```

### UI Recommendations

- Sortable table with columns: Name, Email, Submitted At, Groups
- Group badges with colors
- Search/filter by name or email
- Export to CSV option

---

## 3. Completion Rate

### Endpoint

```
GET /api/survey/:surveyId/completion-rate
GET /api/survey/:surveyId/completion-rate?groupId=<groupId>
```

### Description

Returns completion metrics for the survey. Use this for KPI cards showing progress.

### Request

```typescript
// Path Parameters
surveyId: string;

// Query Parameters (optional)
groupId?: string;
```

### Response

```typescript
interface CompletionRateResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: 'entry' | 'exit';
  totalAssigned: number; // Users in targeted groups
  totalCompleted: number; // Users who submitted
  completionRate: number; // Percentage (0-100)
  pending: number; // Users who haven't completed
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}
```

### Example Response

```json
{
  "surveyId": "survey-uuid",
  "surveyTitle": "Encuesta de Satisfaccion",
  "surveyType": "exit",
  "totalAssigned": 150,
  "totalCompleted": 127,
  "completionRate": 84.67,
  "pending": 23,
  "filters": {
    "groupId": null,
    "groupName": null
  }
}
```

### UI Recommendations

- Progress circle/donut showing completionRate
- KPI cards: Total Assigned, Completed, Pending
- Color coding: Green (>80%), Yellow (50-80%), Red (<50%)

---

## 4. Export Survey Data

### Endpoint

```
GET /api/survey/:surveyId/export
GET /api/survey/:surveyId/export?groupId=<groupId>
```

### Description

Returns all survey data in a structured format optimized for Excel generation. The frontend should transform this JSON into an Excel file.

### Request

```typescript
// Path Parameters
surveyId: string;

// Query Parameters (optional)
groupId?: string;
```

### Response

```typescript
interface SurveyExportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: 'entry' | 'exit';
    eventName: string;
    exportedAt: Date; // Timestamp of export
  };
  questions: {
    id: string;
    text: string;
    type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
    order: number;
    options?: string[]; // For multiple_choice
  }[];
  data: ExportAnswerData[];
  filters: {
    groupId: string | null;
    groupName: string | null;
  };
}

interface ExportAnswerData {
  respondentId: string;
  respondentName: string;
  respondentEmail: string;
  submittedAt: Date;
  groups: string[]; // Array of group names
  answers: {
    questionId: string;
    questionText: string;
    questionType: string;
    answer: string | number | boolean | null;
  }[];
}
```

### Example Response

```json
{
  "survey": {
    "id": "survey-uuid",
    "title": "Encuesta de Satisfaccion",
    "description": "Encuesta post-evento",
    "type": "exit",
    "eventName": "Congreso Anual 2026",
    "exportedAt": "2026-01-22T10:30:00.000Z"
  },
  "questions": [
    {
      "id": "q1",
      "text": "Calificacion general",
      "type": "rating",
      "order": 1
    },
    {
      "id": "q2",
      "text": "Calidad de la comida",
      "type": "multiple_choice",
      "order": 2,
      "options": ["Excelente", "Buena", "Regular", "Mala"]
    },
    {
      "id": "q3",
      "text": "Recomendarias el evento?",
      "type": "boolean",
      "order": 3
    },
    { "id": "q4", "text": "Comentarios", "type": "text", "order": 4 }
  ],
  "data": [
    {
      "respondentId": "user-1",
      "respondentName": "Juan Perez",
      "respondentEmail": "juan@empresa.com",
      "submittedAt": "2026-01-20T14:30:00.000Z",
      "groups": ["VIP", "Mesa 5"],
      "answers": [
        {
          "questionId": "q1",
          "questionText": "Calificacion general",
          "questionType": "rating",
          "answer": 5
        },
        {
          "questionId": "q2",
          "questionText": "Calidad de la comida",
          "questionType": "multiple_choice",
          "answer": "Excelente"
        },
        {
          "questionId": "q3",
          "questionText": "Recomendarias el evento?",
          "questionType": "boolean",
          "answer": true
        },
        {
          "questionId": "q4",
          "questionText": "Comentarios",
          "questionType": "text",
          "answer": "Excelente evento, muy bien organizado"
        }
      ]
    },
    {
      "respondentId": "user-2",
      "respondentName": "Maria Garcia",
      "respondentEmail": "maria@empresa.com",
      "submittedAt": "2026-01-20T15:00:00.000Z",
      "groups": ["General"],
      "answers": [
        {
          "questionId": "q1",
          "questionText": "Calificacion general",
          "questionType": "rating",
          "answer": 4
        },
        {
          "questionId": "q2",
          "questionText": "Calidad de la comida",
          "questionType": "multiple_choice",
          "answer": "Buena"
        },
        {
          "questionId": "q3",
          "questionText": "Recomendarias el evento?",
          "questionType": "boolean",
          "answer": true
        },
        {
          "questionId": "q4",
          "questionText": "Comentarios",
          "questionType": "text",
          "answer": null
        }
      ]
    }
  ],
  "filters": {
    "groupId": null,
    "groupName": null
  }
}
```

### Excel Generation Recommendations

**Suggested Excel Structure:**

**Sheet 1: Survey Info**
| Field | Value |
|-------|-------|
| Survey Title | Encuesta de Satisfaccion |
| Event | Congreso Anual 2026 |
| Type | exit |
| Exported At | 2026-01-22 10:30:00 |
| Total Responses | 127 |

**Sheet 2: Responses (Main Data)**
| Name | Email | Groups | Submitted At | Q1: Calificacion | Q2: Comida | Q3: Recomienda | Q4: Comentarios |
|------|-------|--------|--------------|------------------|------------|----------------|-----------------|
| Juan Perez | juan@... | VIP, Mesa 5 | 2026-01-20 14:30 | 5 | Excelente | Si | Excelente evento... |
| Maria Garcia | maria@... | General | 2026-01-20 15:00 | 4 | Buena | Si | - |

**Libraries Recommendation:**

- [SheetJS (xlsx)](https://www.npmjs.com/package/xlsx) - Most popular
- [ExcelJS](https://www.npmjs.com/package/exceljs) - Better styling support

---

## Filtering by Group

All endpoints support filtering by group. When a `groupId` is provided:

1. Only responses from users belonging to that group are included
2. Completion rate is calculated against users in that group only
3. The `filters` object in the response shows the applied filter

### Example

```
GET /api/survey/abc-123/report?groupId=group-456
```

Response will include:

```json
{
  "filters": {
    "groupId": "group-456",
    "groupName": "VIP"
  }
}
```

### UI Recommendation

Add a group dropdown filter in the report header that:

1. Fetches available groups for the survey's event
2. Updates all dashboard components when selection changes
3. Shows "All Groups" as default option (no groupId param)

---

## Error Responses

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Survey with ID abc-123 not found",
  "error": "Not Found"
}
```

### 404 Group Not Found

```json
{
  "statusCode": 404,
  "message": "Group with ID group-456 not found",
  "error": "Not Found"
}
```

### 400 Bad Request (Invalid UUID)

```json
{
  "statusCode": 400,
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request"
}
```

---

## TypeScript Interfaces (Copy-Paste Ready)

```typescript
// ============================================
// SURVEY REPORT
// ============================================

export interface SurveyReportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: 'entry' | 'exit';
    isActive: boolean;
    eventId: string;
    eventName: string;
  };
  summary: SurveyReportSummary;
  questionStats: QuestionStatistics[];
  filters: ReportFilters;
}

export interface SurveyReportSummary {
  totalResponses: number;
  totalQuestions: number;
  completionRate: number;
  averageRating: number | null;
}

export interface QuestionStatistics {
  questionId: string;
  questionText: string;
  questionType: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  isRequired: boolean;
  order: number;
  options?: string[];
  totalAnswers: number;
  stats: RatingStats | MultipleChoiceStats | BooleanStats | TextStats;
}

export interface RatingStats {
  average: number;
  min: number;
  max: number;
  distribution: Record<number, number>;
}

export interface MultipleChoiceStats {
  distribution: Record<string, { count: number; percentage: number }>;
}

export interface BooleanStats {
  yes: { count: number; percentage: number };
  no: { count: number; percentage: number };
}

export interface TextStats {
  responses: string[];
  totalResponses: number;
}

// ============================================
// RESPONDENTS
// ============================================

export interface SurveyRespondentsResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: 'entry' | 'exit';
  totalRespondents: number;
  respondents: RespondentInfo[];
  filters: ReportFilters;
}

export interface RespondentInfo {
  id: string;
  name: string;
  email: string;
  submittedAt: string; // ISO 8601
  groups: GroupInfo[];
}

export interface GroupInfo {
  id: string;
  name: string;
  color: string;
}

// ============================================
// COMPLETION RATE
// ============================================

export interface CompletionRateResponse {
  surveyId: string;
  surveyTitle: string;
  surveyType: 'entry' | 'exit';
  totalAssigned: number;
  totalCompleted: number;
  completionRate: number;
  pending: number;
  filters: ReportFilters;
}

// ============================================
// EXPORT
// ============================================

export interface SurveyExportResponse {
  survey: {
    id: string;
    title: string;
    description: string | null;
    type: 'entry' | 'exit';
    eventName: string;
    exportedAt: string; // ISO 8601
  };
  questions: ExportQuestion[];
  data: ExportAnswerData[];
  filters: ReportFilters;
}

export interface ExportQuestion {
  id: string;
  text: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  order: number;
  options?: string[];
}

export interface ExportAnswerData {
  respondentId: string;
  respondentName: string;
  respondentEmail: string;
  submittedAt: string; // ISO 8601
  groups: string[];
  answers: {
    questionId: string;
    questionText: string;
    questionType: string;
    answer: string | number | boolean | null;
  }[];
}

// ============================================
// COMMON
// ============================================

export interface ReportFilters {
  groupId: string | null;
  groupName: string | null;
}
```

---

## Dashboard Layout Suggestion

```
+------------------------------------------------------------------+
|  Survey Report: Encuesta de Satisfaccion          [Group Filter v]|
+------------------------------------------------------------------+
|                                                                   |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|  | Responses   |  | Completion  |  | Avg Rating  |  | Questions | |
|  |    127      |  |   84.67%    |  |    4.25     |  |     5     | |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  | Rating Distribution       |  | Multiple Choice Results      | |
|  | [Bar Chart]               |  | [Pie Chart]                  | |
|  +---------------------------+  +-------------------------------+ |
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  | Boolean Question          |  | Text Responses               | |
|  | Yes: 90.5% | No: 9.5%     |  | [Scrollable List]            | |
|  +---------------------------+  +-------------------------------+ |
|                                                                   |
|  +---------------------------------------------------------------+|
|  | Respondents Table                              [Export Excel] ||
|  | Name          | Email              | Groups    | Submitted    ||
|  | Juan Perez    | juan@empresa.com   | VIP       | Jan 20, 14:30||
|  | Maria Garcia  | maria@empresa.com  | General   | Jan 20, 15:00||
|  +---------------------------------------------------------------+|
+------------------------------------------------------------------+
```

---

## Questions?

Contact the backend team for any clarifications or additional requirements.
