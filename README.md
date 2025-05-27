<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

  <H1 align="center">Sanfer BackEnd</H1>

# Endpoints

- [x] Crear evento
- [x] Crear Usuarios y asignarlos a eventos y a grupos (por evento)
- [x] Obtener Grupos por usuario y evento
- [x] Crear Grupo en evento
- [ ] Crear Ponentes
- [ ] Crear Hoteles
- [ ] Crear Código de vestimenta
- [ ] Obtener Agendas
- [ ] Obtener Agenda Mobile
- [ ] Obtener Eventos por usuario

# Payloads

Todos los payloads estan preparados en postman

# Stack

- NestJS
- TypeORM
- PostgreSQL
- Docker
- Docker Compose
- Yarn
- Eslint

# Setup

```bash
yarn install
```

# Run

```bash
yarn run start:dev
```

# Test

```bash
yarn run test
```

# Deploy

```bash
docker-compose up -d
```

# Resources

- [NestJS](https://nestjs.com)
- [TypeORM](https://typeorm.io)
- [PostgreSQL](https://www.postgresql.org)
- [Docker](https://www.docker.com)
- [Docker Compose](https://docs.docker.com/compose)
- [Yarn](https://yarnpkg.com)
- [Eslint](https://eslint.org)

# Event Management System API

## Base URL

```
http://localhost:3000/api
```

## 📋 Table of Contents

- [Events](#events)
- [Event Users](#event-users)
- [Event Groups](#event-groups)
- [Event Agenda](#event-agenda)

---

## 🎉 Events

### Create Event

**POST** `/event`

Creates a new event with all the necessary information.

**Request Body:**

```json
{
  "name": "Tech Conference 2025",
  "campus": "Main Campus",
  "campusPhone": "+1-555-0123",
  "campusMap": "https://maps.example.com/main-campus",
  "dressCode": "Business Casual",
  "startDate": "2025-06-15T09:00:00Z",
  "endDate": "2025-06-17T18:00:00Z",
  "tips": "Bring your laptop and networking cards",
  "extra": "Lunch will be provided",
  "banner": "https://example.com/banner.jpg",
  "campusImage": "https://example.com/campus.jpg",
  "dressCodeImage": "https://example.com/dress-code.jpg"
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Tech Conference 2025",
  "campus": "Main Campus",
  "campusPhone": "+1-555-0123",
  "campusMap": "https://maps.example.com/main-campus",
  "dressCode": "Business Casual",
  "startDate": "2025-06-15T09:00:00.000Z",
  "endDate": "2025-06-17T18:00:00.000Z",
  "tips": "Bring your laptop and networking cards",
  "extra": "Lunch will be provided",
  "banner": "https://example.com/banner.jpg",
  "campusImage": "https://example.com/campus.jpg",
  "dressCodeImage": "https://example.com/dress-code.jpg"
}
```

### Get All Events

**GET** `/event`

Retrieves all events with their users, groups, and agendas.

**Response:**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Tech Conference 2025",
    "startDate": "2025-06-15T09:00:00.000Z",
    "endDate": "2025-06-17T18:00:00.000Z",
    "groups": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "Developers",
        "color": "#FF5733"
      }
    ],
    "users": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "user": {
          "id": "012e3456-e89b-12d3-a456-426614174003",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "groups": [...]
      }
    ],
    "agendas": [...]
  }
]
```

### Get Event by ID

**GET** `/event/{id}`

Retrieves a specific event by its ID.

**Parameters:**

- `id` (UUID) - Event ID

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Tech Conference 2025",
  "campus": "Main Campus",
  "startDate": "2025-06-15T09:00:00.000Z",
  "endDate": "2025-06-17T18:00:00.000Z",
  "groups": [...],
  "users": [...],
  "agendas": [...]
}
```

### Update Event

**PUT** `/event/{id}`

Updates an existing event.

**Parameters:**

- `id` (UUID) - Event ID

**Request Body:** (same as Create Event, all fields optional)

```json
{
  "name": "Updated Tech Conference 2025",
  "dressCode": "Smart Casual"
}
```

### Delete Event

**DELETE** `/event/{id}`

Deletes an event and all related data.

**Parameters:**

- `id` (UUID) - Event ID

### Assign Users to Event

**POST** `/event/assignment/{id}`

Assigns multiple users to an event and optionally to specific groups.

**Parameters:**

- `id` (UUID) - Event ID

**Request Body:**

```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "groups": ["Developers", "VIP"]
  },
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "groups": ["Managers"]
  },
  {
    "name": "Bob Johnson",
    "email": "bob@example.com"
  }
]
```

### Get User Assignments for Event

**GET** `/event/{eventId}/assignments/{userId}`

Gets assignment details for a specific user in an event.

**Parameters:**

- `eventId` (UUID) - Event ID
- `userId` (UUID) - User ID

**Response:**

```json
[
  {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "event": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Tech Conference 2025"
    },
    "user": {
      "id": "012e3456-e89b-12d3-a456-426614174003",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "groups": [
      {
        "id": "456e7890-e89b-12d3-a456-426614174001",
        "name": "Developers",
        "color": "#FF5733"
      }
    ]
  }
]
```

---

## 👥 Event Users

### Create User

**POST** `/event-user`

Creates a new user if they don't already exist.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "groups": ["Developers", "VIP"]
}
```

**Response:**

```json
{
  "id": "012e3456-e89b-12d3-a456-426614174003",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "[hashed_password]"
}
```

### Get All Users

**GET** `/event-user`

Retrieves all users with their event assignments and groups.

**Response:**

```json
[
  {
    "id": "012e3456-e89b-12d3-a456-426614174003",
    "name": "John Doe",
    "email": "john@example.com",
    "events": [
      {
        "id": "789e0123-e89b-12d3-a456-426614174002",
        "event": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Tech Conference 2025"
        },
        "groups": [...]
      }
    ]
  }
]
```

---

## 🏷️ Event Groups

### Create Group for Event

**POST** `/event-group/event/{eventId}`

Creates a new group within a specific event.

**Parameters:**

- `eventId` (UUID) - Event ID

**Request Body:**

```json
{
  "name": "Developers",
  "color": "#FF5733"
}
```

**Response:**

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "Developers",
  "color": "#FF5733",
  "event": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Tech Conference 2025"
  }
}
```

### Get Groups by Event

**GET** `/event-group/event/{eventId}`

Retrieves all groups for a specific event.

**Parameters:**

- `eventId` (UUID) - Event ID

**Response:**

```json
[
  {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "Developers",
    "color": "#FF5733",
    "event": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Tech Conference 2025"
    }
  },
  {
    "id": "567e8901-e89b-12d3-a456-426614174004",
    "name": "Managers",
    "color": "#33FF57"
  }
]
```

### Get Group by ID

**GET** `/event-group/{id}`

Retrieves a specific group with its activities and assignments.

**Parameters:**

- `id` (UUID) - Group ID

**Response:**

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "Developers",
  "color": "#FF5733",
  "event": {...},
  "activities": [...],
  "assignments": [...]
}
```

### Update Group

**PUT** `/event-group/{id}`

Updates an existing group.

**Parameters:**

- `id` (UUID) - Group ID

**Request Body:**

```json
{
  "name": "Senior Developers",
  "color": "#FF8C33"
}
```

### Delete Group

**DELETE** `/event-group/{id}`

Deletes a group and all its associations.

**Parameters:**

- `id` (UUID) - Group ID

---

## 📅 Event Agenda

### Create Agenda Item

**POST** `/event-agenda`

Creates a new agenda item (activity) for an event.

**Request Body:**

```json
{
  "startDate": "2025-06-15T10:00:00Z",
  "endDate": "2025-06-15T11:30:00Z",
  "title": "Opening Keynote",
  "description": "Welcome keynote by industry leaders",
  "location": "Main Auditorium",
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "groupIds": [
    "456e7890-e89b-12d3-a456-426614174001",
    "567e8901-e89b-12d3-a456-426614174004"
  ]
}
```

**Response:**

```json
{
  "id": "678e9012-e89b-12d3-a456-426614174005",
  "startDate": "2025-06-15T10:00:00.000Z",
  "endDate": "2025-06-15T11:30:00.000Z",
  "title": "Opening Keynote",
  "description": "Welcome keynote by industry leaders",
  "location": "Main Auditorium",
  "event": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Tech Conference 2025"
  },
  "groups": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "name": "Developers",
      "color": "#FF5733"
    }
  ]
}
```

### Get All Agenda Items

**GET** `/event-agenda`

Retrieves all agenda items ordered by start date.

**Response:**

```json
[
  {
    "id": "678e9012-e89b-12d3-a456-426614174005",
    "startDate": "2025-06-15T10:00:00.000Z",
    "endDate": "2025-06-15T11:30:00.000Z",
    "title": "Opening Keynote",
    "description": "Welcome keynote by industry leaders",
    "location": "Main Auditorium",
    "event": {...},
    "groups": [...]
  },
  {
    "id": "789e0123-e89b-12d3-a456-426614174006",
    "startDate": "2025-06-15T14:00:00.000Z",
    "endDate": "2025-06-15T15:30:00.000Z",
    "title": "React Workshop",
    "description": "Hands-on React development session",
    "location": "Lab Room A",
    "event": {...},
    "groups": [...]
  }
]
```

### Get Agenda Item by ID

**GET** `/event-agenda/{id}`

Retrieves a specific agenda item.

**Parameters:**

- `id` (UUID) - Agenda item ID

**Response:**

```json
{
  "id": "678e9012-e89b-12d3-a456-426614174005",
  "startDate": "2025-06-15T10:00:00.000Z",
  "endDate": "2025-06-15T11:30:00.000Z",
  "title": "Opening Keynote",
  "description": "Welcome keynote by industry leaders",
  "location": "Main Auditorium",
  "event": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Tech Conference 2025"
  },
  "groups": [...]
}
```

### Update Agenda Item

**PUT** `/event-agenda/{id}`

Updates an existing agenda item.

**Parameters:**

- `id` (UUID) - Agenda item ID

**Request Body:** (all fields optional)

```json
{
  "title": "Updated Opening Keynote",
  "location": "Grand Auditorium",
  "description": "Updated description",
  "groupIds": ["456e7890-e89b-12d3-a456-426614174001"]
}
```

### Delete Agenda Item

**DELETE** `/event-agenda/{id}`

Deletes an agenda item.

**Parameters:**

- `id` (UUID) - Agenda item ID

---

## 🚨 Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Event with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "error": "Not Found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "An unexpected database error occurred",
  "error": "Internal Server Error"
}
```

---

## 📝 Notes

1. **Authentication**: Currently not implemented. All endpoints are public.
2. **Default Password**: All created users get the default password "Sanfer2025" (hashed).
3. **Validation**: All dates must be in ISO format and future dates only.
4. **Groups**: Groups are case-insensitive when assigning users.
5. **UUIDs**: All IDs are UUID v4 format.
6. **Pagination**: Not implemented yet - all GET endpoints return full results.

## 🔧 Environment Variables Required

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=event_management
PORT=3000
```
