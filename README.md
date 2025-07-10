<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <H1 align="center">Sanfer Event Management API</H1>

# Progress Checklist

- [x] ✅ Crear evento
- [x] ✅ Crear Usuarios y asignarlos a eventos y a grupos (por evento)
- [x] ✅ Obtener Grupos por usuario y evento
- [x] ✅ Crear Grupo en evento
- [x] ✅ Crear Ponentes
- [x] ✅ Crear Hoteles
- [x] ✅ Crear Encuestas (Entrada/Salida) con preguntas
- [x] ✅ Sistema completo de encuestas y respuestas con métricas
- [x] ✅ Crear y gestionar agenda de eventos
- [ ] 🔄 Crear Código de vestimenta
- [ ] 🔄 Obtener Agenda Mobile optimizada
- [ ] 🔄 Obtener Eventos por usuario con filtros

# Tech Stack

- **Backend**: NestJS + TypeORM
- **Database**: PostgreSQL
- **Container**: Docker + Docker Compose
- **Package Manager**: Yarn
- **Code Quality**: ESLint + Prettier

# Quick Start

```bash
# Install dependencies
yarn install

# Development
yarn run start:dev

# Production
yarn run start:prod

# Testing
yarn run test

# Docker deployment
docker-compose up -d
```

---

# 🚀 Complete API Documentation

## Base URL

```
http://localhost:3000/api
```

## 📋 Quick Navigation

- [🎉 Events Management](#-events-management)
- [👥 Users & Assignments](#-users--assignments)
- [🏷️ Groups Management](#%EF%B8%8F-groups-management)
- [📅 Event Agenda](#-event-agenda)
- [🎤 Speakers Management](#-speakers-management)
- [🏨 Hotels Management](#-hotels-management)
- [📊 Survey System](#-survey-system)
- [❓ Survey Questions](#-survey-questions)
- [📝 Survey Responses](#-survey-responses)
- [🔧 Error Handling](#-error-handling)

---

## 🎉 Events Management

The core entity that contains all event information and related resources.

### Create Event

**POST** `/event`

Creates a comprehensive event with all details needed for management.

**Request Body:**

```json
{
  "name": "Tech Innovation Summit 2025",
  "campus": "Silicon Valley Convention Center",
  "campusPhone": "+1-555-TECH-001",
  "campusMap": "https://maps.google.com/silicon-valley-center",
  "dressCode": "Smart Business Casual",
  "startDate": "2025-07-15T08:00:00Z",
  "endDate": "2025-07-17T19:00:00Z",
  "tips": "Bring your laptop, business cards, and be ready to network!",
  "extra": "Free lunch, coffee breaks, and networking cocktail included",
  "banner": "https://cdn.example.com/events/tech-summit-banner.jpg",
  "campusImage": "https://cdn.example.com/venues/silicon-valley-center.jpg",
  "dressCodeImage": "https://cdn.example.com/guides/business-casual.jpg"
}
```

**Response Example:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Tech Innovation Summit 2025",
  "campus": "Silicon Valley Convention Center",
  "campusPhone": "+1-555-TECH-001",
  "campusMap": "https://maps.google.com/silicon-valley-center",
  "dressCode": "Smart Business Casual",
  "startDate": "2025-07-15T08:00:00.000Z",
  "endDate": "2025-07-17T19:00:00.000Z",
  "tips": "Bring your laptop, business cards, and be ready to network!",
  "extra": "Free lunch, coffee breaks, and networking cocktail included",
  "banner": "https://cdn.example.com/events/tech-summit-banner.jpg",
  "campusImage": "https://cdn.example.com/venues/silicon-valley-center.jpg",
  "dressCodeImage": "https://cdn.example.com/guides/business-casual.jpg"
}
```

### Get All Events

**GET** `/event`

Retrieves all events with complete related data (users, groups, agenda, speakers, hotels, surveys).

**Response Example:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025",
    "startDate": "2025-07-15T08:00:00.000Z",
    "endDate": "2025-07-17T19:00:00.000Z",
    "groups": [
      {
        "id": "660f9500-f30c-52e5-b827-557766551111",
        "name": "VIP Speakers",
        "color": "#FF6B35"
      },
      {
        "id": "770fa611-040d-63f6-c938-668877662222",
        "name": "Attendees",
        "color": "#4ECDC4"
      }
    ],
    "users": [
      {
        "id": "880fb722-151e-74g7-da49-779988773333",
        "user": {
          "id": "990fc833-262f-85h8-eb5a-88aa99884444",
          "name": "Alice Johnson",
          "email": "alice@techcorp.com"
        },
        "groups": [...]
      }
    ],
    "agendas": [...],
    "speakers": [...],
    "hotels": [...],
    "surveys": [...]
  }
]
```

### Get Event by ID

**GET** `/event/{id}`

**Example:** `GET /event/550e8400-e29b-41d4-a716-446655440000`

### Update Event

**PUT** `/event/{id}`

Updates any event field. All fields are optional.

**Example Request:**

```json
{
  "name": "Tech Innovation Summit 2025 - Updated",
  "tips": "Updated: Don't forget to download our mobile app!",
  "banner": "https://cdn.example.com/events/updated-banner.jpg"
}
```

### Delete Event

**DELETE** `/event/{id}`

⚠️ **Warning:** This cascades and deletes ALL related data (users, groups, agenda, speakers, hotels, surveys).

### Assign Users to Event

**POST** `/event/assignment/{eventId}`

Bulk assigns users to an event with optional group assignments. Users are created if they don't exist.

**Example Request:**

```json
[
  {
    "name": "Dr. Sarah Chen",
    "email": "sarah.chen@university.edu",
    "groups": ["VIP Speakers", "Keynote"]
  },
  {
    "name": "Michael Rodriguez",
    "email": "m.rodriguez@startup.io",
    "groups": ["Attendees", "Developers"]
  },
  {
    "name": "Emma Thompson",
    "email": "emma@designstudio.com"
  }
]
```

**Key Features:**

- Creates users automatically with default password "Sanfer2025"
- Groups are matched by name (case-insensitive)
- Existing users are updated with new group assignments
- Groups must exist in the event before assignment

### Get User Assignments

**GET** `/event/{eventId}/assignments/{userId}`

Retrieves detailed assignment information for a specific user in an event.

---

## 👥 Users & Assignments

Manages event participants and their group memberships.

### Create User

**POST** `/event-user`

Creates a user if they don't already exist (based on email).

**Request Example:**

```json
{
  "name": "Alex Rivera",
  "email": "alex@company.com",
  "groups": ["Developers", "Workshop Leaders"]
}
```

**Response:**

```json
{
  "id": "aa0fd944-373g-96i9-fc6b-99bb00995555",
  "name": "Alex Rivera",
  "email": "alex@company.com",
  "password": "[hashed_password_Sanfer2025]"
}
```

### Get All Users

**GET** `/event-user`

Returns all users with their complete event assignments and group memberships.

### Get Users by Event

**GET** `/event-user/{eventId}`

**Example:** `GET /event-user/550e8400-e29b-41d4-a716-446655440000`

Returns all users assigned to a specific event with their assigned groups.

**Response Example:**

```json
[
  {
    "id": "990fc833-262f-85h8-eb5a-88aa99884444",
    "name": "Alice Johnson",
    "email": "alice@techcorp.com",
    "assignedGroups": [
      {
        "id": "660f9500-f30c-52e5-b827-557766551111",
        "name": "VIP Speakers",
        "color": "#FF6B35"
      }
    ]
  }
]
```

---

## 🏷️ Groups Management

Organize event participants into manageable groups for targeted activities.

### Create Group

**POST** `/event-group/event/{eventId}`

Creates a group within a specific event.

**Request Example:**

```json
{
  "name": "Workshop Leaders",
  "color": "#9B59B6"
}
```

**Response:**

```json
{
  "id": "bb1gd055-484h-a7j0-gd7c-aaccbb006666",
  "name": "Workshop Leaders",
  "color": "#9B59B6",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025"
  }
}
```

### Get Groups by Event

**GET** `/event-group/event/{eventId}`

**Example:** `GET /event-group/event/550e8400-e29b-41d4-a716-446655440000`

### Get Group Details

**GET** `/event-group/{groupId}`

Returns group with associated activities and user assignments.

### Update Group

**PUT** `/event-group/{groupId}`

**Example:**

```json
{
  "name": "Senior Workshop Leaders",
  "color": "#8E44AD"
}
```

### Delete Group

**DELETE** `/event-group/{groupId}`

Removes group and all user-group associations.

---

## 📅 Event Agenda

Schedule and manage event activities with precise timing and group targeting.

### Create Agenda Item

**POST** `/event-agenda`

Creates a scheduled activity for an event.

**Request Example:**

```json
{
  "startDate": "2025-07-15T09:00:00Z",
  "endDate": "2025-07-15T10:30:00Z",
  "title": "Opening Keynote: The Future of AI",
  "description": "Industry-leading experts discuss breakthrough AI technologies and their impact on business transformation.",
  "location": "Main Auditorium - Level 1",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "groupIds": [
    "660f9500-f30c-52e5-b827-557766551111",
    "770fa611-040d-63f6-c938-668877662222"
  ]
}
```

**Response:**

```json
{
  "id": "cc2he166-595i-b8k1-he8d-bbddcc117777",
  "startDate": "2025-07-15T09:00:00.000Z",
  "endDate": "2025-07-15T10:30:00.000Z",
  "title": "Opening Keynote: The Future of AI",
  "description": "Industry-leading experts discuss breakthrough AI technologies...",
  "location": "Main Auditorium - Level 1",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025"
  },
  "groups": [
    {
      "id": "660f9500-f30c-52e5-b827-557766551111",
      "name": "VIP Speakers",
      "color": "#FF6B35"
    }
  ]
}
```

### Get All Agenda Items

**GET** `/event-agenda`

Returns all agenda items across all events, ordered by start time.

### Get Agenda by Event

**GET** `/event-agenda/{eventId}`

**Example:** `GET /event-agenda/550e8400-e29b-41d4-a716-446655440000`

Returns chronologically ordered agenda for a specific event.

### Get Agenda Item

**GET** `/event-agenda/{agendaId}`

### Update Agenda Item

**PUT** `/event-agenda/{agendaId}`

**Example:**

```json
{
  "title": "Opening Keynote: AI & Machine Learning Revolution",
  "location": "Grand Auditorium - Level 2",
  "groupIds": ["660f9500-f30c-52e5-b827-557766551111"]
}
```

### Delete Agenda Item

**DELETE** `/event-agenda/{agendaId}`

---

## 🎤 Speakers Management

Manage event speakers with their presentations and specializations.

### Create Speaker

**POST** `/speaker`

**Request Example:**

```json
{
  "name": "Dr. Maria Gonzalez",
  "presentation": "Quantum Computing: Breaking the Boundaries",
  "specialty": "Quantum Physics & Computer Science",
  "photoUrl": "https://cdn.example.com/speakers/maria-gonzalez.jpg",
  "eventId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "id": "dd3if277-6a6j-c9l2-if9e-cceedd228888",
  "name": "Dr. Maria Gonzalez",
  "presentation": "Quantum Computing: Breaking the Boundaries",
  "specialty": "Quantum Physics & Computer Science",
  "photoUrl": "https://cdn.example.com/speakers/maria-gonzalez.jpg",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025"
  }
}
```

### Get All Speakers

**GET** `/speaker`

### Get Speakers by Event

**GET** `/speaker/event/{eventId}`

**Example:** `GET /speaker/event/550e8400-e29b-41d4-a716-446655440000`

### Get Speaker Details

**GET** `/speaker/{speakerId}`

### Update Speaker

**PUT** `/speaker/{speakerId}`

**Example:**

```json
{
  "presentation": "Quantum Computing: The Next Frontier",
  "photoUrl": "https://cdn.example.com/speakers/maria-gonzalez-updated.jpg"
}
```

### Delete Speaker

**DELETE** `/speaker/{speakerId}`

---

## 🏨 Hotels Management

Manage accommodation options for event attendees.

### Create Hotel

**POST** `/hotel`

**Request Example:**

```json
{
  "name": "Grand Tech Plaza Hotel",
  "photoUrl": "https://cdn.example.com/hotels/grand-tech-plaza.jpg",
  "address": "123 Innovation Boulevard, Silicon Valley, CA 94025",
  "phone": "+1-555-HOTEL-01",
  "mapUrl": "https://maps.google.com/grand-tech-plaza-hotel",
  "eventId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "id": "ee4jg388-7b7k-d0m3-jg0f-ddffeee339999",
  "name": "Grand Tech Plaza Hotel",
  "photoUrl": "https://cdn.example.com/hotels/grand-tech-plaza.jpg",
  "address": "123 Innovation Boulevard, Silicon Valley, CA 94025",
  "phone": "+1-555-HOTEL-01",
  "mapUrl": "https://maps.google.com/grand-tech-plaza-hotel",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025"
  }
}
```

### Get All Hotels

**GET** `/hotel`

### Get Hotels by Event

**GET** `/hotel/event/{eventId}`

**Example:** `GET /hotel/event/550e8400-e29b-41d4-a716-446655440000`

### Get Hotel Details

**GET** `/hotel/{hotelId}`

### Update Hotel

**PUT** `/hotel/{hotelId}`

### Delete Hotel

**DELETE** `/hotel/{hotelId}`

---

## 📊 Survey System

Comprehensive survey system supporting entry and exit evaluations with multiple question types.

### Create Simple Survey

**POST** `/survey`

Creates a survey without questions (questions added separately).

**Request Example:**

```json
{
  "title": "Event Entry Assessment",
  "description": "Initial evaluation to understand attendee expectations and background",
  "type": "entry",
  "isActive": true,
  "eventId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 🚀 Create Complete Survey

**POST** `/survey/with-questions`

**⭐ Recommended:** Creates survey with all questions in a single API call.

**Request Example:**

```json
{
  "title": "Tech Summit Entry Survey",
  "description": "Pre-event evaluation to tailor your experience",
  "type": "entry",
  "isActive": true,
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "questions": [
    {
      "questionText": "What are your primary learning objectives for this summit?",
      "questionType": "text",
      "isRequired": true,
      "order": 1
    },
    {
      "questionText": "What is your current role in technology?",
      "questionType": "multiple_choice",
      "isRequired": true,
      "order": 2,
      "options": [
        "Software Developer",
        "Product Manager",
        "Data Scientist",
        "Engineering Manager",
        "CTO/Technical Executive",
        "Student",
        "Other"
      ]
    },
    {
      "questionText": "How would you rate your experience with AI/ML technologies? (1-10)",
      "questionType": "rating",
      "isRequired": false,
      "order": 3
    },
    {
      "questionText": "Is this your first time attending a tech summit?",
      "questionType": "boolean",
      "isRequired": true,
      "order": 4
    },
    {
      "questionText": "Which topics interest you most?",
      "questionType": "multiple_choice",
      "isRequired": false,
      "order": 5,
      "options": [
        "Artificial Intelligence",
        "Blockchain Technology",
        "Cloud Computing",
        "Cybersecurity",
        "DevOps",
        "Mobile Development"
      ]
    }
  ]
}
```

**Response:**

```json
{
  "id": "ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa",
  "title": "Tech Summit Entry Survey",
  "description": "Pre-event evaluation to tailor your experience",
  "type": "entry",
  "isActive": true,
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025"
  },
  "questions": [
    {
      "id": "gg6li5aa-9d9m-f2o5-li2h-ffgggg55bbbb",
      "questionText": "What are your primary learning objectives for this summit?",
      "questionType": "text",
      "isRequired": true,
      "order": 1,
      "options": null
    },
    {
      "id": "hh7mj6bb-aean-g3p6-mj3i-gghhhh66cccc",
      "questionText": "What is your current role in technology?",
      "questionType": "multiple_choice",
      "isRequired": true,
      "order": 2,
      "options": [
        "Software Developer",
        "Product Manager",
        "Data Scientist",
        "Engineering Manager",
        "CTO/Technical Executive",
        "Student",
        "Other"
      ]
    }
  ]
}
```

### Get All Surveys

**GET** `/survey`

### Get Surveys by Event

**GET** `/survey/event/{eventId}`

**Example:** `GET /survey/event/550e8400-e29b-41d4-a716-446655440000`

Returns both entry and exit surveys for the event.

### Get Survey Details

**GET** `/survey/{surveyId}`

Basic survey information without questions.

### Get Survey with Questions

**GET** `/survey/{surveyId}/with-questions`

**Example:** `GET /survey/ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa/with-questions`

Returns survey with all questions ordered by sequence.

### Get Survey Metrics

**GET** `/survey/{surveyId}/metrics`

**Example Response:**

```json
{
  "surveyId": "ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa",
  "title": "Tech Summit Entry Survey",
  "type": "entry",
  "totalResponses": 127,
  "totalQuestions": 5,
  "isActive": true
}
```

### Update Simple Survey

**PUT** `/survey/{surveyId}`

Updates survey metadata only.

### 🚀 Update Complete Survey

**PUT** `/survey/{surveyId}/with-questions`

**⭐ Recommended:** Intelligently manages survey and questions in one call.

**Request Example:**

```json
{
  "title": "Updated Tech Summit Entry Survey",
  "description": "Enhanced pre-event evaluation",
  "questions": [
    {
      "id": "gg6li5aa-9d9m-f2o5-li2h-ffgggg55bbbb",
      "questionText": "What are your TOP 3 learning objectives for this summit?",
      "questionType": "text",
      "isRequired": true,
      "order": 1
    },
    {
      "questionText": "How many years of experience do you have in tech?",
      "questionType": "multiple_choice",
      "isRequired": true,
      "order": 2,
      "options": ["0-2 years", "3-5 years", "6-10 years", "10+ years"]
    }
  ]
}
```

**Smart Update Logic:**

- Questions with `id`: Updated
- Questions without `id`: Created as new
- Questions not included: Deleted

### Delete Survey

**DELETE** `/survey/{surveyId}`

Cascades to delete all questions and responses.

---

## ❓ Survey Questions

Individual question management (useful for fine-grained control).

### Create Question

**POST** `/survey-question`

**Request Example:**

```json
{
  "questionText": "What networking opportunities are you most interested in?",
  "questionType": "multiple_choice",
  "isRequired": false,
  "order": 6,
  "options": [
    "One-on-one mentoring sessions",
    "Group networking events",
    "Industry-specific meetups",
    "Informal coffee chats",
    "Online community access"
  ],
  "surveyId": "ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa"
}
```

### Get Questions by Survey

**GET** `/survey-question/survey/{surveyId}`

Returns questions ordered by sequence.

### Update Question

**PUT** `/survey-question/{questionId}`

### Delete Question

**DELETE** `/survey-question/{questionId}`

---

## 📝 Survey Responses

Handle survey submissions and retrieve response data for analytics.

### 🚀 Submit Complete Survey Response

**POST** `/survey-response/submit`

**⭐ Primary endpoint for mobile/web apps**

**Request Example:**

```json
{
  "surveyId": "ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa",
  "userId": "990fc833-262f-85h8-eb5a-88aa99884444",
  "answers": [
    {
      "questionId": "gg6li5aa-9d9m-f2o5-li2h-ffgggg55bbbb",
      "answerValue": "Learn about AI implementation strategies, understand quantum computing basics, and network with industry leaders"
    },
    {
      "questionId": "hh7mj6bb-aean-g3p6-mj3i-gghhhh66cccc",
      "selectedOption": "Software Developer"
    },
    {
      "questionId": "ii8nk7cc-bfbo-h4q7-nk4j-hhiiii77dddd",
      "ratingValue": 7
    },
    {
      "questionId": "jj9ol8dd-cgcp-i5r8-ol5k-iijjjj88eeee",
      "booleanValue": false
    },
    {
      "questionId": "kk0pm9ee-dhdq-j6s9-pm6l-jjkkkk99ffff",
      "selectedOption": "Artificial Intelligence"
    }
  ]
}
```

**Response:**

```json
{
  "id": "ll1qn0ff-eier-k7t0-qn7m-kkllll00gggg",
  "submittedAt": "2025-07-14T15:30:45.123Z",
  "survey": {
    "id": "ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa",
    "title": "Tech Summit Entry Survey",
    "type": "entry"
  },
  "user": {
    "id": "990fc833-262f-85h8-eb5a-88aa99884444",
    "name": "Alice Johnson",
    "email": "alice@techcorp.com"
  },
  "answers": [
    {
      "id": "mm2ro1gg-fjfs-l8u1-ro8n-llmmmm11hhhh",
      "answerValue": "Learn about AI implementation strategies, understand quantum computing basics, and network with industry leaders",
      "selectedOption": null,
      "ratingValue": null,
      "booleanValue": null,
      "question": {
        "id": "gg6li5aa-9d9m-f2o5-li2h-ffgggg55bbbb",
        "questionText": "What are your primary learning objectives for this summit?",
        "questionType": "text"
      }
    }
  ]
}
```

### Check if User Already Responded

**GET** `/survey-response/check/{surveyId}/{userId}`

**Example:** `GET /survey-response/check/ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa/990fc833-262f-85h8-eb5a-88aa99884444`

**Response:** `true` or `false`

### Get All Survey Responses

**GET** `/survey-response`

Admin endpoint to retrieve all responses across all surveys.

### Get Responses by Survey

**GET** `/survey-response/survey/{surveyId}`

**Example:** `GET /survey-response/survey/ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa`

Analytics endpoint to get all responses for a specific survey.

### Get Responses by User

**GET** `/survey-response/user/{userId}`

**Example:** `GET /survey-response/user/990fc833-262f-85h8-eb5a-88aa99884444`

Retrieves all surveys a user has completed.

### Get Response Details

**GET** `/survey-response/{responseId}`

Full response details with all answers.

### Delete Response

**DELETE** `/survey-response/{responseId}`

Admin function to remove a response.

---

## 🎯 Question Types Reference

### 1. Text Questions

```json
{
  "questionType": "text",
  "questionText": "Describe your goals for this event"
}
```

**Answer format:** `"answerValue": "My detailed response here"`

### 2. Multiple Choice Questions

```json
{
  "questionType": "multiple_choice",
  "questionText": "What's your experience level?",
  "options": ["Beginner", "Intermediate", "Advanced", "Expert"]
}
```

**Answer format:** `"selectedOption": "Intermediate"`

### 3. Rating Questions

```json
{
  "questionType": "rating",
  "questionText": "Rate your excitement level (1-10)"
}
```

**Answer format:** `"ratingValue": 8`

### 4. Boolean Questions

```json
{
  "questionType": "boolean",
  "questionText": "Is this your first tech conference?"
}
```

**Answer format:** `"booleanValue": true`

---

## 🔧 Error Handling

### Standard Error Responses

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "Title must be at least 3 characters long",
    "Event ID must be a valid UUID"
  ],
  "error": "Bad Request"
}
```

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Survey with ID ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa not found",
  "error": "Not Found"
}
```

#### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "User has already responded to this survey",
  "error": "Conflict"
}
```

#### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "An unexpected database error occurred",
  "error": "Internal Server Error"
}
```

---

## 📊 Use Case Examples

### Complete Event Setup Workflow

```bash
# 1. Create Event
POST /event
{
  "name": "DevCon 2025",
  "startDate": "2025-08-01T09:00:00Z",
  "endDate": "2025-08-03T18:00:00Z"
}

# 2. Create Groups
POST /event-group/event/{eventId}
{"name": "Speakers", "color": "#E74C3C"}

POST /event-group/event/{eventId}
{"name": "Attendees", "color": "#3498DB"}

# 3. Add Speakers
POST /speaker
{
  "name": "John Doe",
  "presentation": "Future of Development",
  "specialty": "Software Engineering",
  "eventId": "{eventId}"
}

# 4. Add Hotels
POST /hotel
{
  "name": "Conference Hotel",
  "address": "123 Main St",
  "phone": "+1-555-0123",
  "eventId": "{eventId}"
}

# 5. Create Survey with Questions
POST /survey/with-questions
{
  "title": "Entry Survey",
  "type": "entry",
  "eventId": "{eventId}",
  "questions": [
    {
      "questionText": "What are your expectations?",
      "questionType": "text",
      "isRequired": true,
      "order": 1
    }
  ]
}

# 6. Create Agenda Items
POST /event-agenda
{
  "title": "Opening Keynote",
  "startDate": "2025-08-01T09:00:00Z",
  "endDate": "2025-08-01T10:30:00Z",
  "eventId": "{eventId}",
  "groupIds": ["{speakersGroupId}", "{attendeesGroupId}"]
}

# 7. Assign Users to Event
POST /event/assignment/{eventId}
[
  {
    "name": "Alice Johnson",
    "email": "alice@company.com",
    "groups": ["Attendees"]
  }
]
```

### Mobile App Survey Flow

```bash
# 1. Get event surveys
GET /survey/event/{eventId}

# 2. Check if user already responded
GET /survey-response/check/{surveyId}/{userId}

# 3. Get survey questions for display
GET /survey/{surveyId}/with-questions

# 4. Submit user responses
POST /survey-response/submit
{
  "surveyId": "{surveyId}",
  "userId": "{userId}",
  "answers": [
    {
      "questionId": "{questionId}",
      "answerValue": "User's text response"
    },
    {
      "questionId": "{questionId}",
      "selectedOption": "Selected choice"
    }
  ]
}
```

### Dashboard Analytics Workflow

```bash
# 1. Get event overview
GET /event/{eventId}

# 2. Get survey metrics
GET /survey/{surveyId}/metrics

# 3. Get all survey responses for analysis
GET /survey-response/survey/{surveyId}

# 4. Get event agenda
GET /event-agenda/{eventId}

# 5. Get event speakers
GET /speaker/event/{eventId}

# 6. Get event hotels
GET /hotel/event/{eventId}
```

---

## 🚀 Advanced Features

### Survey Management Best Practices

1. **Create surveys early** in event planning
2. **Use the `/with-questions` endpoints** for efficiency
3. **Check user responses** before showing surveys in mobile apps
4. **Use survey metrics** for real-time dashboard updates
5. **Implement proper error handling** for better UX

### Performance Considerations

- All list endpoints return full related data
- Use specific ID endpoints when you only need single records
- Survey responses can grow large - consider pagination for analytics
- Event deletion cascades through all related entities

### Mobile App Integration

The API is designed for seamless mobile app integration:

- **Optimized endpoints** like `/survey-response/submit` for single API calls
- **User verification** endpoints to prevent duplicate submissions
- **Complete data responses** to minimize API calls
- **Standardized error formats** for consistent error handling

---

## 🔐 Security Notes

- **No authentication** currently implemented (endpoints are public)
- **Default password** "Sanfer2025" for all auto-created users
- **Input validation** implemented on all endpoints
- **SQL injection protection** via TypeORM parameterized queries
- **CORS enabled** for cross-origin requests

---

## 📱 Database Schema Overview

```
Events (1:many) → Groups, Users (via assignments), Agenda, Speakers, Hotels, Surveys
├── Groups (many:many) → Users (via assignments), Agenda items
├── Users (many:many) → Events (via assignments), Survey responses
├── Agenda (many:many) → Groups
├── Speakers (many:one) → Events
├── Hotels (many:one) → Events
└── Surveys (1:many) → Questions, Responses
    ├── Questions (1:many) → Question answers
    └── Responses (1:many) → Question answers
        └── Question Answers (many:one) → Questions, Responses
```

---

## 🔧 Environment Setup

### Required Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=sanfer_events

# Application Configuration
PORT=3000
NODE_ENV=development

# Optional: Redis for caching (future implementation)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Development Database Setup

```bash
# Using Docker
docker run --name postgres-sanfer \
  -e POSTGRES_DB=sanfer_events \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14

# Or use docker-compose
docker-compose up -d
```

### Production Deployment

```bash
# Build for production
yarn build

# Start production server
yarn start:prod

# Or use Docker
docker build -t sanfer-api .
docker run -p 3000:3000 --env-file .env sanfer-api
```

---

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov

# Watch mode for development
yarn test:watch
```

---

## 📊 API Collections

### Postman Collection

All endpoints are documented in Postman with example requests and responses. Import the collection from:

```
/docs/postman/sanfer-api-collection.json
```

### Insomnia Collection

Also available for Insomnia users:

```
/docs/insomnia/sanfer-api-workspace.json
```

---

## 🚀 Roadmap

### Phase 1 - Core Features ✅

- [x] Event management
- [x] User assignment system
- [x] Group management
- [x] Agenda scheduling
- [x] Speaker profiles
- [x] Hotel information
- [x] Complete survey system

### Phase 2 - Enhanced Features 🔄

- [ ] Authentication & authorization
- [ ] File upload for images
- [ ] Push notifications
- [ ] Real-time updates via WebSockets
- [ ] Advanced analytics dashboard
- [ ] Email integration

### Phase 3 - Advanced Features 🔮

- [ ] Multi-language support
- [ ] Mobile app deep linking
- [ ] QR code generation
- [ ] Calendar integration
- [ ] Social media sharing
- [ ] Advanced reporting with charts

---

## 💡 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Use TypeScript strict mode
- Follow NestJS conventions
- Write comprehensive tests
- Document all public APIs
- Use meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

For support and questions:

- 📧 **Email**: <support@sanfer.com>
- 📞 **Phone**: +1-555-SANFER-1
- 💬 **Slack**: #sanfer-api-support
- 🐛 **Issues**: [GitHub Issues](https://github.com/sanfer/api/issues)

---

**Built with ❤️ by the Sanfer Team**
