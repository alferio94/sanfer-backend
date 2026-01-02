# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sanfer Event Management API** - A NestJS-based backend for managing corporate events with features for participants, agendas, surveys, speakers, hotels, and transportation.

**Stack**: NestJS 11.x + TypeORM 0.3.22 + PostgreSQL + JWT Authentication

**Requirements**: Node.js >=20.0.0

## Development Commands

```bash
# Development
yarn install              # Install dependencies
yarn start:dev           # Start dev server with hot reload
yarn start:debug         # Start in debug mode with hot reload

# Build & Production
yarn build               # Build for production
yarn start:prod          # Run production build

# Code Quality
yarn lint                # Run ESLint with auto-fix
yarn format             # Format code with Prettier

# Testing
yarn test                # Run unit tests
yarn test:watch          # Run tests in watch mode
yarn test:cov           # Generate coverage report
yarn test:debug          # Run tests in debug mode
yarn test:e2e           # Run end-to-end tests

# Docker
docker-compose up -d     # Start PostgreSQL database
```

## Architecture Overview

### Module Structure

The application is organized into **feature modules** with a dual authentication system:

**Core Event Management:**
- `event/` - Event CRUD, user assignments, event-user relationships
- `event-user/` - Event participants (mobile app users)
- `event-group/` - Organize users into groups per event
- `event-agenda/` - Schedule activities with group targeting
- `event-transport/` - Transportation options for groups
- `app-menu/` - Configure which sections appear in mobile app per event

**Event Resources:**
- `event-speakers/` - Speaker profiles
- `event-hotel/` - Accommodation information
- `survey/` - Survey CRUD with entry/exit types
- `survey-question/` - Question management (text, multiple_choice, rating, boolean)
- `survey-response/` - User survey submissions
- `survey-answer/` - Individual question answers

**Authentication:**
- `usuarios/` - Admin users for dashboard (15min access tokens, 7 day refresh)
- `event-user/` - Mobile app authentication (7 day access tokens, 30 day refresh)

**Shared:**
- `common/` - Guards, utilities, shared resources

### Database Design Pattern

**Central Entity**: `AppEvent` (events table)
- All resources are scoped to an event via foreign key
- Cascading deletes configured (deleting event removes all related data)
- Many-to-many relationships use junction tables (e.g., `EventUserAssignment`, `EventAgenda.groups`)

**Key Relationships:**
```
Event (1:many) → Groups, Speakers, Hotels, Surveys, Transports, Agenda, AppMenu
Event (many:many) → EventUsers (via EventUserAssignment)
EventGroup (many:many) → Agenda, Transports, EventUserAssignment
Survey (1:many) → Questions → Answers
SurveyResponse (1:many) → QuestionAnswers
```

### Dual Authentication System

**Admin Authentication** (`usuarios/`):
- **Purpose**: Dashboard/admin operations
- **Guard**: `JwtAuthGuard` (strategy: 'jwt')
- **Tokens**: 15min access, 7 day refresh
- **Endpoints**: Admin CRUD, app menu management

**Event User Authentication** (`event-user/`):
- **Purpose**: Mobile app participants
- **Guard**: `EventUserAuthGuard` (strategy: 'event-user-jwt')
- **Tokens**: 7 day access, 30 day refresh
- **Endpoints**: User events, agenda, surveys, speakers, hotels, transports
- **Critical**: Email normalization (lowercase) for login to prevent duplicate accounts

**Important**: Most event management endpoints (`/event/*`) are currently **public** (no auth required) for dashboard operations. Mobile-specific endpoints require event user JWT.

### Global Configuration

**API Prefix**: `/api` (configured in `main.ts`)
**Port**: 3000 (default, override with `PORT` environment variable)
**CORS**: Enabled with credentials (`origin: true, credentials: true`)
**Validation**: Global `ValidationPipe` with:
  - `whitelist: true` - strips non-whitelisted properties
  - `forbidNonWhitelisted: true` - throws error if non-whitelisted properties are present
  - `transformOptions: { exposeUnsetFields: true }`
**TypeORM Sync**: `synchronize: true` ⚠️ **Must be `false` in production**

## Common Development Tasks

### Adding a New Protected Endpoint

1. Import the appropriate guard:
   ```typescript
   // For admin endpoints
   import { JwtAuthGuard } from '../common/guards/auth.guard';

   // For mobile app endpoints
   import { EventUserAuthGuard } from '../event-user/guards/event-user-auth.guard';
   ```

2. Apply to controller method:
   ```typescript
   @UseGuards(JwtAuthGuard)  // or EventUserAuthGuard
   @Get('protected-route')
   async protectedMethod() { ... }
   ```

### Working with Database Errors

Use the centralized error handler located in `src/common/utils/dbError.utils.ts`:

```typescript
import { handleDBError } from '../common/utils/dbError.utils';

try {
  await this.repository.save(entity);
} catch (error) {
  handleDBError(error); // Throws appropriate NestJS exceptions
}
```

### Password Hashing

Use the centralized hash utilities in `src/common/utils/hash.utils.ts`:

```typescript
import { hashPassword, comparePassword } from '../common/utils/hash.utils';

// Hash a password
const hashedPassword = await hashPassword(plainPassword);

// Verify a password
const isValid = await comparePassword(plainPassword, hashedPassword);
```

### Creating Entity Relationships

**One-to-Many Example**:
```typescript
// Parent (Event)
@OneToMany(() => Speaker, (speaker) => speaker.event, { cascade: true })
speakers: Speaker[];

// Child (Speaker)
@ManyToOne(() => AppEvent, (event) => event.speakers, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'eventId' })
event: AppEvent;
```

**Many-to-Many with Junction Table**:
```typescript
// EventAgenda entity
@ManyToMany(() => EventGroup, (group) => group.agendas)
@JoinTable({
  name: 'event_agenda_groups',
  joinColumn: { name: 'agendaId', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'groupId', referencedColumnName: 'id' },
})
groups: EventGroup[];
```

### Email Normalization Pattern

**Critical for event users**: Always normalize emails to lowercase to prevent duplicate accounts:

```typescript
// In DTOs
@Transform(({ value }) => value?.toLowerCase())
@IsEmail()
email: string;

// In services
const user = await this.repository.findOne({
  where: { email: email.toLowerCase() }
});
```

This is implemented in `event-user/` module and prevents issues like "USER@EXAMPLE.COM" and "user@example.com" creating separate accounts.

## Important Notes

### TypeORM Synchronize Warning

⚠️ **Critical**: `synchronize: true` in `app.module.ts` (line 30) automatically syncs schema changes to the database. This is **dangerous in production** and should be set to `false`. Use migrations instead.

### Default Passwords

Auto-created event users receive a default password based on the current year: `"Sanfer{YEAR}"` (e.g., "Sanfer2026" in 2026, "Sanfer2027" in 2027). This is generated dynamically in `event-user.service.ts:40-41` using `new Date().getFullYear()`.

### Environment Variables

The app requires the following environment variables (see `.env.layout` for database config):

```env
# Database (provided in .env.layout)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Password1234
DB_NAME=sanfer-db

# JWT (NOT in .env.layout - must add manually)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Server (optional)
PORT=3000  # Defaults to 3000 if not set
```

⚠️ **Critical**: `JWT_SECRET` is not included in `.env.layout` but is required for the app to run.

### Cascade Delete Behavior

Deleting an event will **cascade delete** all related:
- Groups, Speakers, Hotels, Surveys (with questions/responses), Transports, Agenda, AppMenu, User assignments

This is by design but be aware when implementing delete functionality.

### Timezone Considerations

Agenda dates are stored as UTC timestamps. The codebase includes timezone conversion logic (see `event-agenda.service.ts` line 91-119) to group events by CDMX timezone dates for the mobile app calendar view.

### Survey Question Types

Supported types: `text`, `multiple_choice`, `rating`, `boolean`
- `multiple_choice` requires `options: string[]` field
- Answers use different fields: `answerValue`, `selectedOption`, `ratingValue`, `booleanValue`

## Multi-Tenant Architecture (Future)

⚠️ **Important**: A comprehensive multi-tenant architecture analysis exists in `docs/arquitectura-multi-tenant-analisis.md`. The recommended approach is **Schema-per-Tenant** (PostgreSQL schemas) for scaling to multiple corporate clients. The current codebase is **single-tenant** but is well-structured for future migration.

## Testing Strategy

- Unit tests use Jest configuration in `package.json`
- Test files: `*.spec.ts` pattern
- E2E tests: Separate config in `test/jest-e2e.json`
- Coverage directory: `coverage/`

## API Documentation

The comprehensive API documentation is in `README.md` with:
- All endpoints documented with examples
- Authentication requirements clearly marked with 🔒
- Mobile-optimized endpoints marked with 📱
- Complete request/response examples
- Error handling patterns

Key sections:
- Admin Authentication (`/usuarios/*`)
- Mobile App Authentication (`/event-user/*`)
- Event Management (`/event/*`)
- Mobile-specific endpoints (agenda, surveys, speakers, etc.)
