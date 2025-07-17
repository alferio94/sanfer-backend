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
- [x] ✅ Crear y gestionar transportes para eventos
- [x] ✅ Sistema de autenticación JWT para usuarios administradores
- [x] ✅ Sistema de autenticación JWT para usuarios de eventos (mobile app)
- [x] ✅ Endpoint para obtener eventos por usuario
- [x] ✅ Sistema de configuración de menú de app móvil
- [ ] 🔄 Crear Código de vestimenta
- [x] ✅ Obtener Agenda Mobile optimizada

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
- [📱 Mobile App Endpoints](#-mobile-app-endpoints)
- [🔐 Admin Authentication](#-admin-authentication)
- [📱 Mobile App Authentication](#-mobile-app-authentication)
- [👥 Users & Assignments](#-users--assignments)
- [📋 App Menu Configuration](#-app-menu-configuration)
- [🏷️ Groups Management](#%EF%B8%8F-groups-management)
- [📅 Event Agenda](#-event-agenda)
- [🚌 Event Transport](#-event-transport)
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
    "surveys": [...],
    "transports": [...]
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

### Get Events by User

**GET** `/event/user/{userId}` 🔒

**🔒 Requires Event User Authentication**

Retrieves all events assigned to a specific event user.

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example:** `GET /event/user/990fc833-262f-85h8-eb5a-88aa99884444`

**Response Example:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025",
    "campus": "Silicon Valley Convention Center",
    "startDate": "2025-07-15T08:00:00.000Z",
    "endDate": "2025-07-17T19:00:00.000Z",
    "banner": "https://cdn.example.com/events/tech-summit-banner.jpg",
    "groups": [
      {
        "id": "660f9500-f30c-52e5-b827-557766551111",
        "name": "VIP Speakers",
        "color": "#FF6B35"
      }
    ],
    "agendas": [
      {
        "id": "cc2he166-595i-b8k1-he8d-bbddcc117777",
        "title": "Opening Keynote",
        "startDate": "2025-07-15T09:00:00.000Z",
        "endDate": "2025-07-15T10:30:00.000Z",
        "location": "Main Auditorium"
      }
    ]
  }
]
```

### Create Event User and Assign to Event

**POST** `/event/{eventId}/user`

Creates a new event user and assigns them to the specified event. If the user already exists (based on email), they will be assigned to the event. Email validation is case-insensitive.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "JOHN.DOE@EXAMPLE.COM",
  "groups": ["VIP Speakers", "Attendees"]
}
```

**Response Example:**

```json
{
  "message": "User created and assigned to event successfully",
  "user": {
    "id": "990fc833-262f-85h8-eb5a-88aa99884444",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "assignment": {
    "id": "assignment-uuid",
    "groups": [
      {
        "id": "660f9500-f30c-52e5-b827-557766551111",
        "name": "VIP Speakers",
        "color": "#FF6B35"
      }
    ]
  }
}
```

**Key Features:**
- **Case-insensitive email validation**: "JOHN@EXAMPLE.COM" and "john@example.com" are treated as the same user
- **Automatic user creation**: If user doesn't exist, creates with default password "Sanfer2025"
- **Group assignment**: Assigns user to specified groups (must exist in the event)
- **Duplicate prevention**: If user is already assigned to the event, returns existing assignment

### Remove User from Event

**DELETE** `/event/{eventId}/user/{userId}`

Removes the relationship between a user and an event, effectively unassigning the user from the event.

**Example:** `DELETE /event/550e8400-e29b-41d4-a716-446655440000/user/990fc833-262f-85h8-eb5a-88aa99884444`

**Response:** 200 OK (no content)

**Error Responses:**
- **404 Not Found**: User assignment not found for this event
- **400 Bad Request**: Invalid UUID format for eventId or userId

---

## 📱 Mobile App Endpoints

Endpoints específicamente diseñados para la aplicación móvil. Estos endpoints están optimizados para el consumo de datos en dispositivos móviles.

### Event User Login

**POST** `/event-user/login`

Permite a los usuarios de eventos iniciar sesión en la aplicación móvil.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Sanfer2025"
}
```

**Response:**

```json
{
  "message": "Login exitoso",
  "user": {
    "id": "990fc833-262f-85h8-eb5a-88aa99884444",
    "name": "Alice Johnson",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

### Get User's Events

**GET** `/event/user/{userId}` 🔒

**🔒 Requires Event User Authentication**

Obtiene todos los eventos asignados a un usuario específico con toda la información necesaria para la app móvil.

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example:**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025",
    "campus": "Silicon Valley Convention Center",
    "startDate": "2025-07-15T08:00:00.000Z",
    "endDate": "2025-07-17T19:00:00.000Z",
    "banner": "https://cdn.example.com/events/tech-summit-banner.jpg",
    "groups": [...],
    "agendas": [...],
    "appMenu": {
      "id": "menu-uuid",
      "transporte": true,
      "alimentos": true,
      "codigoVestimenta": false,
      "ponentes": true,
      "encuestas": true,
      "hotel": true,
      "agenda": true,
      "atencionMedica": false,
      "sede": true
    }
  }
]
```

### Get App Menu Configuration

**GET** `/app-menu/event/{eventId}`

Obtiene la configuración del menú de la app para un evento específico. Si no existe configuración, se crea automáticamente con todas las secciones habilitadas.

**Response Example:**

```json
{
  "message": "App menu obtenido exitosamente",
  "appMenu": {
    "id": "menu-uuid",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "transporte": true,
    "alimentos": true,
    "codigoVestimenta": true,
    "ponentes": true,
    "encuestas": true,
    "hotel": true,
    "agenda": true,
    "atencionMedica": true,
    "sede": true
  }
}
```

### Refresh Tokens

**POST** `/event-user/refresh`

Renueva los tokens de autenticación para mantener la sesión activa.

**Request Body:**

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

### Submit Survey Response

**POST** `/survey-response/submit`

Endpoint optimizado para enviar respuestas de encuestas desde la app móvil.

**Request Example:**

```json
{
  "surveyId": "ff5kh499-8c8l-e1n4-kh1g-eeffff44aaaa",
  "userId": "990fc833-262f-85h8-eb5a-88aa99884444",
  "answers": [
    {
      "questionId": "gg6li5aa-9d9m-f2o5-li2h-ffgggg55bbbb",
      "answerValue": "My response here"
    },
    {
      "questionId": "hh7mj6bb-aean-g3p6-mj3i-gghhhh66cccc",
      "selectedOption": "Software Developer"
    }
  ]
}
```

### Check Survey Completion

**GET** `/survey-response/check/{surveyId}/{userId}`

Verifica si un usuario ya completó una encuesta específica.

**Response:** `true` o `false`

### Mobile App Integration Notes

- **Token Duration**: Access tokens duran 7 días, refresh tokens 30 días
- **Offline Support**: Los datos pueden ser cacheados localmente
- **Menu Configuration**: La app debe respetar las secciones habilitadas/deshabilitadas
- **Auto-refresh**: Implementar renovación automática de tokens
- **Error Handling**: Manejar 401 para redirigir a login

---

## 🔐 Admin Authentication

Sistema de autenticación JWT para usuarios administradores del dashboard con access tokens y refresh tokens.

### Register Admin User

**POST** `/usuarios/register`

Crea un nuevo usuario administrador para acceder al dashboard.

**Request Body:**

```json
{
  "email": "admin@company.com",
  "password": "SecurePassword123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "rol": "admin"
}
```

**Response:**

```json
{
  "message": "Usuario creado exitosamente",
  "usuario": {
    "id": "uuid-del-usuario",
    "email": "admin@company.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "admin",
    "activo": true,
    "createdAt": "2025-07-14T15:30:00.000Z",
    "updatedAt": "2025-07-14T15:30:00.000Z"
  }
}
```

### Login

**POST** `/usuarios/login`

Inicia sesión y obtiene tokens de acceso y renovación.

**Request Body:**

```json
{
  "email": "admin@company.com",
  "password": "SecurePassword123"
}
```

**Response:**

```json
{
  "message": "Login exitoso",
  "usuario": {
    "id": "uuid-del-usuario",
    "email": "admin@company.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "rol": "admin",
    "activo": true,
    "createdAt": "2025-07-14T15:30:00.000Z",
    "updatedAt": "2025-07-14T15:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Token Details:**
- **Access Token**: Válido por 15 minutos, usado para autenticar requests
- **Refresh Token**: Válido por 7 días, usado para renovar access tokens

### Refresh Tokens

**POST** `/usuarios/refresh`

Renueva el access token usando el refresh token.

**Request Body:**

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response:**

```json
{
  "message": "Tokens renovados exitosamente",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6"
}
```

### Logout

**POST** `/usuarios/logout`

Cierra sesión invalidando el refresh token.

**Request Body:**

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response:**

```json
{
  "message": "Logout exitoso"
}
```

### Protected Admin Endpoints

Los siguientes endpoints requieren autenticación JWT:

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get Current User Profile

**GET** `/usuarios/me`

**🔒 Requires Authentication**

Returns the profile information of the currently authenticated user based on the JWT token.

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "id": "uuid-del-usuario",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "admin@company.com",
  "rol": "admin",
  "activo": true,
  "fechaCreacion": "2025-07-14T15:30:00.000Z",
  "fechaActualizacion": "2025-07-14T15:30:00.000Z"
}
```

**Key Features:**
- Returns user data based on JWT token in Authorization header
- No password field included in response
- Maps database field names to Spanish format (createdAt → fechaCreacion)
- Returns 401 if token is invalid or expired

#### Get All Admin Users

**GET** `/usuarios`

**🔒 Requires Authentication**

```json
{
  "message": "Usuarios obtenidos exitosamente",
  "usuarios": [
    {
      "id": "uuid-del-usuario",
      "email": "admin@company.com",
      "nombre": "Juan",
      "apellido": "Pérez",
      "rol": "admin",
      "activo": true,
      "createdAt": "2025-07-14T15:30:00.000Z",
      "updatedAt": "2025-07-14T15:30:00.000Z"
    }
  ]
}
```

#### Get Admin User by ID

**GET** `/usuarios/{id}`

**🔒 Requires Authentication**

#### Update Admin User

**PATCH** `/usuarios/{id}`

**🔒 Requires Authentication**

**Request Body:**
```json
{
  "nombre": "Juan Carlos",
  "email": "juan.carlos@company.com"
}
```

#### Delete Admin User (Soft Delete)

**DELETE** `/usuarios/{id}`

**🔒 Requires Authentication**

Desactiva el usuario (soft delete) en lugar de eliminarlo completamente.

### Authentication Flow for Frontend

```javascript
// 1. Login
const loginResponse = await fetch('/usuarios/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, refreshToken } = await loginResponse.json();

// Store tokens securely
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 2. Make authenticated requests
const response = await fetch('/usuarios', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// 3. Handle token expiration
if (response.status === 401) {
  // Refresh token
  const refreshResponse = await fetch('/usuarios/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      refreshToken: localStorage.getItem('refreshToken') 
    })
  });
  
  if (refreshResponse.ok) {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      await refreshResponse.json();
    
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    // Retry original request
  } else {
    // Redirect to login
    window.location.href = '/login';
  }
}

// 4. Logout
await fetch('/usuarios/logout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    refreshToken: localStorage.getItem('refreshToken') 
  })
});

localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

### Environment Variables Required

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

**Security Notes:**
- Access tokens expire in 15 minutes for security
- Refresh tokens expire in 7 days
- Refresh tokens are hashed in the database
- Logout invalidates refresh tokens
- All admin endpoints require valid JWT tokens

---

## 📱 Mobile App Authentication

Sistema de autenticación JWT específicamente diseñado para usuarios de eventos que acceden a través de la aplicación móvil.

### Event User Login

**POST** `/event-user/login`

Permite a los usuarios de eventos iniciar sesión con su email y contraseña predefinida.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Sanfer2025"
}
```

**Response:**

```json
{
  "message": "Login exitoso",
  "user": {
    "id": "990fc833-262f-85h8-eb5a-88aa99884444",
    "name": "Alice Johnson",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Token Details:**
- **Access Token**: Válido por 7 días, usado para autenticar requests
- **Refresh Token**: Válido por 30 días, usado para renovar access tokens

### Refresh Event User Tokens

**POST** `/event-user/refresh`

Renueva el access token usando el refresh token.

**Request Body:**

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response:**

```json
{
  "message": "Tokens renovados exitosamente",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6"
}
```

### Event User Logout

**POST** `/event-user/logout`

Cierra sesión invalidando el refresh token.

**Request Body:**

```json
{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Response:**

```json
{
  "message": "Logout exitoso"
}
```

### Get Event User Profile

**GET** `/event-user/profile` 🔒

**🔒 Requires Event User Authentication**

Obtiene los datos completos del usuario autenticado basándose en el token JWT. Este endpoint es esencial para la persistencia de sesión en la aplicación móvil.

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "user": {
    "id": "990fc833-262f-85h8-eb5a-88aa99884444",
    "name": "Alice Johnson",
    "email": "alice@techcorp.com"
  }
}
```

**Key Features:**
- **Session persistence**: Permite recuperar información del usuario al reiniciar la app
- **Secure**: Requiere token JWT válido para acceder
- **Complete user data**: Retorna id, name y email del usuario
- **Password excluded**: Por seguridad, no incluye el password en la respuesta

**Mobile App Usage:**

```javascript
// Recuperar perfil del usuario al iniciar la app
const getUserProfile = async () => {
  const token = await SecureStore.getItemAsync('accessToken');
  
  const response = await fetch('/event-user/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const { user } = await response.json();
    // Usar datos del usuario para UI
    setUserName(user.name);
    setUserEmail(user.email);
    setUserId(user.id);
  } else if (response.status === 401) {
    // Token expirado, redirigir a login
    navigation.navigate('Login');
  }
};
```

### Protected Mobile Endpoints

Los siguientes endpoints requieren autenticación de usuario de evento:

**Headers Required:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Get User's Events

**GET** `/event/user/{userId}` 🔒

**🔒 Requires Event User Authentication**

Obtiene todos los eventos asignados al usuario autenticado.

#### Get Event User Profile

**GET** `/event-user/profile` 🔒

**🔒 Requires Event User Authentication**

Obtiene los datos completos del usuario autenticado para persistencia de sesión.

### Mobile App Authentication Flow

```javascript
// 1. Login para usuarios de eventos
const loginResponse = await fetch('/event-user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    password: 'Sanfer2025'
  })
});

const { accessToken, refreshToken, user } = await loginResponse.json();

// Store tokens securely (encrypted storage recommended)
await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);
await SecureStore.setItemAsync('userId', user.id);

// 2. Hacer requests autenticados
const response = await fetch(`/event/user/${user.id}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// 3. Manejar expiración de tokens
if (response.status === 401) {
  // Refresh token
  const refreshResponse = await fetch('/event-user/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      refreshToken: await SecureStore.getItemAsync('refreshToken') 
    })
  });
  
  if (refreshResponse.ok) {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      await refreshResponse.json();
    
    await SecureStore.setItemAsync('accessToken', newAccessToken);
    await SecureStore.setItemAsync('refreshToken', newRefreshToken);
    
    // Retry original request with new token
  } else {
    // Redirect to login screen
    navigation.navigate('Login');
  }
}

// 4. Logout
await fetch('/event-user/logout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    refreshToken: await SecureStore.getItemAsync('refreshToken') 
  })
});

// Clear stored data
await SecureStore.deleteItemAsync('accessToken');
await SecureStore.deleteItemAsync('refreshToken');
await SecureStore.deleteItemAsync('userId');
```

### Security Features for Mobile App

- **Longer token duration**: Access tokens duran 7 días, refresh tokens 30 días para mejor UX móvil
- **Persistent sessions**: Los usuarios permanecen logueados hasta logout explícito o expiración
- **Secure token storage**: Se recomienda usar encrypted storage (React Native Keychain/SecureStore)
- **Automatic token refresh**: Sistema transparente de renovación de tokens
- **User scope limitation**: Los usuarios solo pueden acceder a sus eventos asignados

### Diferencias con Admin Authentication

| Feature | Admin Auth | Event User Auth |
|---------|------------|-----------------|
| Access Token Duration | 15 minutos | 7 días |
| Refresh Token Duration | 7 días | 30 días |
| Scope | Dashboard completo | Solo eventos asignados |
| Endpoints | `/usuarios/*` | `/event-user/*` |
| User Type | Administradores | Participantes de eventos |
| Password Changes | Permitidos | No permitidos |

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

### Get Agenda by Event and Group (Mobile Optimized)

**GET** `/event-agenda/{eventId}/group/{groupId}`

**📱 Mobile App Optimized Endpoint**

Gets agenda items for a specific event and group, formatted for React Native Calendar's Agenda component.

**Example:** `GET /event-agenda/550e8400-e29b-41d4-a716-446655440000/group/660f9500-f30c-52e5-b827-557766551111`

**Response Format:**

```json
{
  "2025-07-15": [
    {
      "name": "Opening Keynote: The Future of AI",
      "description": "Industry-leading experts discuss breakthrough AI technologies and their impact on business transformation.",
      "location": "Main Auditorium - Level 1",
      "startDate": "2025-07-15T09:00:00.000Z",
      "endDate": "2025-07-15T10:30:00.000Z",
      "height": 50
    },
    {
      "name": "AI Workshop",
      "description": "Hands-on AI implementation workshop",
      "location": "Workshop Room 1",
      "startDate": "2025-07-15T14:00:00.000Z",
      "endDate": "2025-07-15T16:00:00.000Z",
      "height": 50
    }
  ],
  "2025-07-16": [
    {
      "name": "Tech Panel Discussion",
      "description": "Industry leaders discuss emerging technologies",
      "location": "Panel Room",
      "startDate": "2025-07-16T10:00:00.000Z",
      "endDate": "2025-07-16T11:30:00.000Z",
      "height": 50
    }
  ],
  "2025-07-17": []
}
```

**Key Features:**
- **Date-based grouping**: Items are grouped by date in `YYYY-MM-DD` format
- **React Native Calendar compatible**: Direct integration with Agenda component
- **Group-specific filtering**: Shows only agenda items assigned to the specified group
- **Complete item details**: Includes all necessary information for mobile display
- **Empty dates support**: Days with no activities return empty arrays `[]`

**Usage in React Native:**

```javascript
import { Agenda } from 'react-native-calendars';

const AgendaScreen = ({ eventId, groupId }) => {
  const [agendaItems, setAgendaItems] = useState({});

  useEffect(() => {
    fetch(`/api/event-agenda/${eventId}/group/${groupId}`)
      .then(response => response.json())
      .then(data => setAgendaItems(data));
  }, [eventId, groupId]);

  return (
    <Agenda
      items={agendaItems}
      renderItem={(item) => (
        <View style={styles.agendaItem}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
          <Text style={styles.itemLocation}>{item.location}</Text>
          <Text style={styles.itemTime}>
            {new Date(item.startDate).toLocaleTimeString()} - 
            {new Date(item.endDate).toLocaleTimeString()}
          </Text>
        </View>
      )}
    />
  );
};
```

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

## 🚌 Event Transport

Manage transportation options for event participants with specific group targeting.

### Create Transport

**POST** `/event-transport`

Creates a transportation option for specific groups within an event.

**Request Example:**

```json
{
  "name": "Autobús al Aeropuerto",
  "details": "Servicio de traslado exclusivo desde el hotel hasta el Aeropuerto Internacional",
  "mapUrl": "https://maps.google.com/route-to-airport",
  "type": "bus",
  "departureTime": "2025-07-17T14:00:00Z",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "groupIds": [
    "660f9500-f30c-52e5-b827-557766551111",
    "770fa611-040d-63f6-c938-668877662222"
  ]
}
```

**Types of Transport Available:**

- `airplane`: Avión
- `bus`: Autobús
- `train`: Tren
- `van`: Van o Minibus
- `boat`: Barco

**Response Example:**

```json
{
  "id": "cc2he166-595i-b8k1-he8d-abcdef123456",
  "name": "Autobús al Aeropuerto",
  "details": "Servicio de traslado exclusivo desde el hotel hasta el Aeropuerto Internacional",
  "mapUrl": "https://maps.google.com/route-to-airport",
  "type": "bus",
  "departureTime": "2025-07-17T14:00:00.000Z",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tech Innovation Summit 2025"
  },
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
  ]
}
```

### Get All Transports

**GET** `/event-transport`

Returns all transport options across all events, ordered by departure time.

### Get Transports by Event

**GET** `/event-transport/event/{eventId}`

**Example:** `GET /event-transport/event/550e8400-e29b-41d4-a716-446655440000`

Returns chronologically ordered transport options for a specific event.

### Get Transport Details

**GET** `/event-transport/{id}`

Returns detailed information about a specific transport option.

### Update Transport

**PUT** `/event-transport/{id}`

Updates an existing transport option. All fields are optional.

**Example Request:**

```json
{
  "name": "Autobús VIP al Aeropuerto",
  "departureTime": "2025-07-17T15:30:00Z",
  "groupIds": ["660f9500-f30c-52e5-b827-557766551111"]
}
```

### Delete Transport

**DELETE** `/event-transport/{id}`

Removes a transport option and its associations with groups.

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

## 📋 App Menu Configuration

Sistema que permite a los administradores configurar qué secciones del evento serán visibles en la aplicación móvil.

### Secciones Disponibles

Las siguientes secciones pueden ser habilitadas/deshabilitadas por evento:

- **Transporte** - Información y opciones de transporte
- **Alimentos** - Información sobre comidas y catering
- **Código de Vestimenta** - Guías de vestimenta para el evento
- **Ponentes** - Perfiles y información de speakers
- **Encuestas** - Encuestas de entrada y salida
- **Hotel** - Información de alojamiento
- **Agenda** - Cronograma de actividades
- **Atención Médica** - Información de servicios médicos
- **Sede** - Información del lugar del evento

### Create App Menu Configuration

**POST** `/app-menu` 🔒

**🔒 Requires Admin Authentication**

Crea una configuración de menú para un evento específico.

**Request Body:**

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "transporte": true,
  "alimentos": false,
  "codigoVestimenta": true,
  "ponentes": true,
  "encuestas": true,
  "hotel": false,
  "agenda": true,
  "atencionMedica": false,
  "sede": true
}
```

**Response:**

```json
{
  "message": "App menu creado exitosamente",
  "appMenu": {
    "id": "menu-uuid",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "transporte": true,
    "alimentos": false,
    "codigoVestimenta": true,
    "ponentes": true,
    "encuestas": true,
    "hotel": false,
    "agenda": true,
    "atencionMedica": false,
    "sede": true
  }
}
```

### Get App Menu Configuration

**GET** `/app-menu/event/{eventId}`

Obtiene la configuración del menú para un evento. Si no existe, se crea automáticamente con todas las secciones habilitadas.

**Response:**

```json
{
  "message": "App menu obtenido exitosamente",
  "appMenu": {
    "id": "menu-uuid",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "transporte": true,
    "alimentos": true,
    "codigoVestimenta": true,
    "ponentes": true,
    "encuestas": true,
    "hotel": true,
    "agenda": true,
    "atencionMedica": true,
    "sede": true
  }
}
```

### Update App Menu Configuration

**PUT** `/app-menu/event/{eventId}` 🔒

**🔒 Requires Admin Authentication**

Actualiza la configuración del menú para un evento específico.

**Request Body:**

```json
{
  "transporte": false,
  "alimentos": true,
  "atencionMedica": false
}
```

**Response:**

```json
{
  "message": "App menu actualizado exitosamente",
  "appMenu": {
    "id": "menu-uuid",
    "eventId": "550e8400-e29b-41d4-a716-446655440000",
    "transporte": false,
    "alimentos": true,
    "codigoVestimenta": true,
    "ponentes": true,
    "encuestas": true,
    "hotel": true,
    "agenda": true,
    "atencionMedica": false,
    "sede": true
  }
}
```

### Delete App Menu Configuration

**DELETE** `/app-menu/event/{eventId}` 🔒

**🔒 Requires Admin Authentication**

Elimina la configuración del menú para un evento específico.

### Dashboard Integration

Los administradores pueden gestionar las secciones visibles desde el dashboard:

```javascript
// Obtener configuración actual
const menuConfig = await fetch(`/app-menu/event/${eventId}`, {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

// Actualizar configuración
const updateConfig = await fetch(`/app-menu/event/${eventId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    transporte: true,
    alimentos: false,
    ponentes: true,
    encuestas: true,
    hotel: true,
    agenda: true,
    atencionMedica: false,
    sede: true,
    codigoVestimenta: false
  })
});
```

### Mobile App Usage

La aplicación móvil debe verificar la configuración del menú antes de mostrar las secciones:

```javascript
// La configuración viene incluida en el endpoint de eventos del usuario
const userEvents = await fetch(`/event/user/${userId}`, {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

// Cada evento incluye su configuración appMenu
userEvents.forEach(event => {
  const { appMenu } = event;
  
  // Mostrar solo las secciones habilitadas
  if (appMenu.transporte) showTransportSection();
  if (appMenu.agenda) showAgendaSection();
  if (appMenu.ponentes) showSpeakersSection();
  // etc...
});
```

### Default Behavior

- **Nuevos eventos**: Se crea automáticamente una configuración con todas las secciones habilitadas
- **Eventos existentes**: Al consultar por primera vez, se crea la configuración por defecto
- **Eliminación de eventos**: La configuración del menú se elimina automáticamente (cascade)

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

# 5. Create Transport Options
POST /event-transport
{
  "name": "Airport Shuttle",
  "details": "Complimentary service from airport to conference venue",
  "type": "bus",
  "departureTime": "2025-08-01T07:00:00Z",
  "eventId": "{eventId}",
  "groupIds": ["{speakersGroupId}"]
}

# 6. Create Survey with Questions
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

# 7. Create Agenda Items
POST /event-agenda
{
  "title": "Opening Keynote",
  "startDate": "2025-08-01T09:00:00Z",
  "endDate": "2025-08-01T10:30:00Z",
  "eventId": "{eventId}",
  "groupIds": ["{speakersGroupId}", "{attendeesGroupId}"]
}

# 8. Assign Users to Event
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

### Transportation Management Workflow

```bash
# 1. Create transport options for different groups
POST /event-transport
{
  "name": "VIP Airport Pickup",
  "details": "Luxury service for speakers",
  "type": "van",
  "departureTime": "2025-08-01T06:30:00Z",
  "eventId": "{eventId}",
  "groupIds": ["{speakersGroupId}"]
}

POST /event-transport
{
  "name": "Shuttle to Conference Venue",
  "type": "bus",
  "departureTime": "2025-08-01T08:00:00Z",
  "eventId": "{eventId}",
  "groupIds": ["{attendeesGroupId}"]
}

# 2. Get all transports for an event
GET /event-transport/event/{eventId}

# 3. Update transport details
PUT /event-transport/{transportId}
{
  "departureTime": "2025-08-01T07:00:00Z",
  "details": "Updated pickup information: Look for staff with event signage"
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

# 7. Get event transports
GET /event-transport/event/{eventId}
```

---

## 🚀 Advanced Features

### Survey Management Best Practices

1. **Create surveys early** in event planning
2. **Use the `/with-questions` endpoints** for efficiency
3. **Check user responses** before showing surveys in mobile apps
4. **Use survey metrics** for real-time dashboard updates
5. **Implement proper error handling** for better UX

### Transport Management Best Practices

1. **Create specific transports for different groups** to better manage logistics
2. **Provide detailed instructions** in the details field
3. **Include map URLs** for complex pickup/dropoff locations
4. **Use accurate departure times** with timezone considerations
5. **Update transport information** as logistics change

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
- **Group-based filtering** for showing relevant transports to users

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
Events (1:many) → Groups, Users (via assignments), Agenda, Speakers, Hotels, Surveys, Transports
├── Groups (many:many) → Users (via assignments), Agenda items, Transports
├── Users (many:many) → Events (via assignments), Survey responses
├── Agenda (many:many) → Groups
├── Transports (many:many) → Groups
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

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

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
- [x] Transport management

### Phase 2 - Enhanced Features 🔄

- [x] ✅ Authentication & authorization (JWT with refresh tokens)
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
