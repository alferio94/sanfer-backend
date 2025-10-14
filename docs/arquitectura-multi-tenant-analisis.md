# ANÁLISIS ARQUITECTÓNICO MULTI-TENANT PARA SANFER-BACKEND

## 1. RESUMEN EJECUTIVO

El proyecto **sanfer-backend** es una aplicación NestJS desarrollada para gestionar eventos corporativos, actualmente diseñada como **single-tenant** (monolítico) para Laboratorios Sanfer. El sistema maneja eventos, usuarios, agendas, encuestas, hoteles, transportes y otros recursos relacionados con eventos empresariales.

**Objetivo**: Transformar la arquitectura actual a un modelo **multi-tenant** que soporte múltiples clientes independientes (Sanfer, Novartis, MSD, etc.) con aislamiento completo de datos, compartiendo el mismo código base e infraestructura.

---

## 2. ANÁLISIS DE LA ARQUITECTURA ACTUAL

### 2.1 Stack Tecnológico
- **Framework**: NestJS 11.x
- **ORM**: TypeORM 0.3.22
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (Passport + @nestjs/jwt)
- **Node**: >= 20.0.0
- **Lenguaje**: TypeScript 5.7.3

### 2.2 Estructura de Módulos

El proyecto contiene **105 archivos TypeScript** organizados en los siguientes módulos:

```
src/
├── app.module.ts (módulo raíz)
├── usuarios/ (administradores del sistema)
├── event/ (eventos principales)
├── event-user/ (usuarios participantes de eventos)
├── event-agenda/ (agenda de actividades)
├── event-group/ (grupos dentro de eventos)
├── event-speakers/ (ponentes)
├── event-hotel/ (hoteles)
├── event-transport/ (transportes)
├── survey/ (encuestas)
├── survey-question/ (preguntas de encuestas)
├── survey-answer/ (respuestas individuales)
├── survey-response/ (respuestas completas)
├── app-menu/ (configuración del menú de la app móvil)
└── common/ (utilidades compartidas, guards)
```

### 2.3 Esquema de Base de Datos Actual

#### Entidades Principales Identificadas:

**1. `usuarios` (Administradores)**
- **Archivo**: `src/usuarios/entities/usuario.entity.ts`
- **Campos**: id (UUID), email (unique), password, nombre, apellido, rol, activo
- **Propósito**: Usuarios administradores del sistema con acceso al panel de control

**2. `events` (Eventos)**
- **Archivo**: `src/event/entities/event.entity.ts`
- **Campos**: id, name (unique), campus, startDate, endDate, banner, etc.
- **Relaciones**:
  - OneToMany → EventGroup, EventUserAssignment, EventAgenda, Speaker, Hotel, Survey, EventTransport
  - OneToOne → AppMenu

**3. `event_users` (Participantes de Eventos)**
- **Archivo**: `src/event-user/entities/event-user.entity.ts`
- **Campos**: id, name, email (unique), password
- **Propósito**: Usuarios finales que asisten a eventos (app móvil)

**4. `event_user_assignments` (Asignación Usuario-Evento)**
- **Archivo**: `src/event/entities/event-user-assignment.entity.ts`
- **Relación Many-to-Many**: EventUser ↔ Event
- **Unique constraint**: [event, user]
- **Relación adicional**: ManyToMany con EventGroup

**5. `event_groups` (Grupos de Eventos)**
- **Archivo**: `src/event-group/entities/event-group.entity.ts`
- **Campos**: id, name, color
- **Relación**: ManyToOne → Event

**6. `event_agendas` (Agenda de Actividades)**
- **Archivo**: `src/event-agenda/entities/event-agenda.entity.ts`
- **Campos**: id, startDate, endDate, title, description, location
- **Relaciones**: ManyToOne → Event, ManyToMany → EventGroup

**7. `speakers` (Ponentes)**
- **Archivo**: `src/event-speakers/entities/speakers.entity.ts`
- **Relación**: ManyToOne → Event

**8. `hotels` (Hoteles)**
- **Archivo**: `src/event-hotel/entities/hotel.entity.ts`
- **Relación**: ManyToOne → Event

**9. `event_transports` (Transportes)**
- **Archivo**: `src/event-transport/entities/event-transport.entity.ts`
- **Relaciones**: ManyToOne → Event, ManyToMany → EventGroup

**10. `surveys` (Encuestas)**
- **Archivo**: `src/survey/entities/survey.entity.ts`
- **Campos**: id, title, description, type (ENTRY/EXIT), isActive
- **Relación**: ManyToOne → Event

**11. `survey_questions` (Preguntas)**
- **Archivo**: `src/survey-question/entities/survey-question.entity.ts`
- **Relación**: ManyToOne → Survey

**12. `survey_responses` (Respuestas de Usuarios)**
- **Archivo**: `src/survey-response/entities/survey-response.entity.ts`
- **Unique constraint**: [survey, user]
- **Relaciones**: ManyToOne → Survey, ManyToOne → EventUser

**13. `question_answers` (Respuestas Individuales)**
- **Archivo**: `src/survey-answer/entities/survey-answer.entity.ts`
- **Relaciones**: ManyToOne → SurveyResponse, ManyToOne → SurveyQuestion

**14. `app_menus` (Configuración del Menú App)**
- **Archivo**: `src/app-menu/entities/app-menu.entity.ts`
- **Relación**: OneToOne → Event

**15. `refresh_token` (Tokens de Usuarios Admin)**
- **Archivo**: `src/usuarios/entities/refresh-token.entity.ts`

**16. `event_user_refresh_token` (Tokens de Event Users)**
- **Archivo**: `src/event-user/entities/event-user-refresh-token.entity.ts`

### 2.4 Jerarquía de Datos

```
TENANT (NO EXISTE ACTUALMENTE)
  └── eventos (AppEvent)
       ├── grupos (EventGroup)
       ├── agenda (EventAgenda) → vinculada a grupos
       ├── ponentes (Speaker)
       ├── hoteles (Hotel)
       ├── transportes (EventTransport) → vinculados a grupos
       ├── encuestas (Survey)
       │    └── preguntas (SurveyQuestion)
       │         └── respuestas (SurveyAnswer)
       ├── usuarios de evento (EventUser) → via EventUserAssignment
       └── configuración menú (AppMenu)

USUARIOS ADMIN (usuarios) - Transversal, no asociado a eventos
```

### 2.5 Autenticación y Autorización

**Sistema Dual de Autenticación:**

1. **Administradores (`usuarios`):**
   - **Guard**: `JwtAuthGuard` → `src/common/guards/auth.guard.ts`
   - **Strategy**: Passport JWT 'jwt'
   - **Access Token**: 15 minutos
   - **Refresh Token**: 7 días
   - **Servicio**: `src/usuarios/usuarios.service.ts`

2. **Usuarios de Eventos (`event_users`):**
   - **Guard**: `EventUserAuthGuard` → `src/event-user/guards/event-user-auth.guard.ts`
   - **Strategy**: Passport JWT 'event-user-jwt'
   - **Access Token**: 7 días
   - **Refresh Token**: 30 días
   - **Servicio**: `src/event-user/event-user-auth.service.ts`

**Hallazgo Crítico**: No existe autorización a nivel de tenant. Los usuarios pueden potencialmente acceder a datos de cualquier evento si tienen el ID.

### 2.6 Configuración de Base de Datos

**Archivo**: `src/app.module.ts`

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: true,  // ⚠️ CRÍTICO: Cambiar a false en producción
})
```

**Variables de entorno** (`.env.layout`):
```
DB_PASSWORD=Password1234
DB_NAME=sanfer-db
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
```

### 2.7 Patrones Identificados

**Puntos Positivos:**
✅ Arquitectura modular bien organizada con separación clara de responsabilidades
✅ Uso consistente de DTOs para validación
✅ Manejo centralizado de errores de BD (`handleDBError` en common/utils)
✅ Relaciones de cascada bien definidas (CASCADE en OneToMany)
✅ Constraints de unicidad apropiados (email único, unique constraints compuestos)
✅ Sistema de autenticación robusto con refresh tokens

**Puntos a Mejorar para Multi-Tenancy:**
❌ No existe concepto de "tenant" o "organización"
❌ Restricción única global en `events.name` (debe ser por tenant)
❌ Restricción única global en `event_users.email` (debe permitir mismo email en diferentes tenants)
❌ Sin scope de queries a nivel de tenant
❌ Sin middleware/interceptor para inyectar tenant context
❌ JWT no incluye información de tenant
❌ `synchronize: true` es peligroso en producción

---

## 3. PUNTOS DE AISLAMIENTO DE DATOS REQUERIDOS

Para implementar multi-tenancy, estos son los puntos críticos de aislamiento:

### 3.1 Recursos que DEBEN ser aislados por Tenant

| Recurso | Tabla | Razón |
|---------|-------|-------|
| ✅ Eventos | `events` | Cada cliente tiene sus propios eventos |
| ✅ Usuarios de Eventos | `event_users` | Los participantes son específicos del tenant |
| ✅ Grupos | `event_groups` | Específicos de eventos del tenant |
| ✅ Agenda | `event_agendas` | Derivado de eventos del tenant |
| ✅ Ponentes | `speakers` | Específicos de eventos del tenant |
| ✅ Hoteles | `hotels` | Específicos de eventos del tenant |
| ✅ Transportes | `event_transports` | Específicos de eventos del tenant |
| ✅ Encuestas | `surveys` | Específicas de eventos del tenant |
| ✅ Preguntas | `survey_questions` | Derivadas de encuestas del tenant |
| ✅ Respuestas | `survey_responses`, `question_answers` | Datos sensibles del tenant |
| ✅ Menús App | `app_menus` | Configuración específica del tenant |
| ✅ Asignaciones | `event_user_assignments` | Relaciones del tenant |
| ✅ Tokens | `refresh_token`, `event_user_refresh_token` | Sesiones del tenant |

### 3.2 Recursos Compartidos (Posiblemente)

| Recurso | Tabla | Consideración |
|---------|-------|---------------|
| ⚠️ Usuarios Admin | `usuarios` | Podrían ser compartidos para super-admins o aislados si cada tenant gestiona sus propios admins |

**Recomendación**: Los `usuarios` (administradores) también deberían estar vinculados a tenants para permitir que cada organización gestione sus propios administradores.

---

## 4. ESTRATEGIAS DE MULTI-TENANCY PROPUESTAS

### ESTRATEGIA 1: BASE DE DATOS POR TENANT (Database-per-Tenant)

#### Descripción
Cada cliente (tenant) tiene su propia base de datos PostgreSQL completamente independiente. La aplicación se conecta dinámicamente a la base de datos correspondiente según el tenant identificado.

#### Arquitectura
```
sanfer-db          (Base de datos para Sanfer)
novartis-db        (Base de datos para Novartis)
msd-db             (Base de datos para MSD)
tenant-registry-db (Base de datos maestra con configuración de tenants)
```

#### Implementación en NestJS

**1. Entidad Tenant Registry (DB Maestra)**
```typescript
@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tenantKey: string; // 'sanfer', 'novartis', 'msd'

  @Column({ unique: true })
  domain: string; // 'sanfer.app.com', 'novartis.app.com'

  @Column()
  dbHost: string;

  @Column()
  dbPort: number;

  @Column()
  dbName: string;

  @Column({ select: false })
  dbUsername: string;

  @Column({ select: false })
  dbPassword: string;

  @Column({ default: true })
  isActive: boolean;
}
```

**2. Configuración Dinámica de TypeORM**
```typescript
// Usar DataSource dinámico basado en tenant
const tenantDataSource = new DataSource({
  type: 'postgres',
  host: tenantConfig.dbHost,
  port: tenantConfig.dbPort,
  database: tenantConfig.dbName,
  username: tenantConfig.dbUsername,
  password: tenantConfig.dbPassword,
  entities: [...],
});
```

**3. Identificación de Tenant**
- **Opción A**: Por subdominio (`sanfer.api.app.com`, `novartis.api.app.com`)
- **Opción B**: Por header HTTP (`X-Tenant-ID: sanfer`)
- **Opción C**: Por path (`/api/sanfer/events`, `/api/novartis/events`)

#### Pros

| ✅ Ventaja | Descripción |
|-----------|-------------|
| **Máximo aislamiento** | Los datos están físicamente separados. Un fallo en una DB no afecta a otras. |
| **Seguridad superior** | Imposible acceder accidentalmente a datos de otro tenant. |
| **Rendimiento independiente** | Cada tenant puede tener su propio plan de recursos (RDS/Cloud SQL dedicado). |
| **Cumplimiento normativo** | Ideal para sectores regulados (GDPR, HIPAA) que requieren aislamiento físico. |
| **Escalabilidad horizontal** | Cada tenant puede vivir en un servidor diferente. |
| **Restauración granular** | Backups y restauraciones independientes por tenant. |
| **Personalización por tenant** | Permite customizaciones de esquema específicas (migraciones opcionales). |

#### Cons

| ❌ Desventaja | Descripción |
|-------------|-------------|
| **Complejidad operativa ALTA** | Gestionar N bases de datos, migraciones, backups. |
| **Costos elevados** | Cada tenant requiere instancia de BD (costos por instancia en cloud). |
| **Migraciones complejas** | Cada nueva migración debe aplicarse a TODAS las bases de datos. |
| **Reporting cross-tenant difícil** | Consultas agregadas entre tenants requieren federación o ETL. |
| **Pool de conexiones** | Gestionar conexiones para múltiples bases de datos consume más recursos. |
| **Onboarding lento** | Agregar un nuevo tenant implica provisionar una nueva BD (minutos/horas). |
| **Schema drift** | Riesgo de que bases de datos queden desincronizadas si falla una migración. |

#### Complejidad de Migración

**ALTA** 🔴

**Pasos requeridos:**
1. Crear base de datos maestra de tenants
2. Implementar TenantService para gestión de configuraciones
3. Crear interceptor/middleware para identificar tenant por request
4. Modificar TypeORM para usar DataSource dinámico
5. Implementar sistema de conexiones por tenant con caché
6. Crear script de migración para mover datos existentes a `sanfer-db`
7. Implementar sistema de migraciones multi-tenant
8. Actualizar todos los servicios para usar conexión dinámica
9. Implementar sistema de monitoreo por BD
10. Configurar backups independientes

**Tiempo estimado**: 4-6 semanas

#### Escalabilidad

**Excelente** ⭐⭐⭐⭐⭐
- Escalabilidad horizontal ilimitada
- Cada tenant puede crecer independientemente
- Ideal para 100+ tenants grandes

#### Costo

**ALTO** 💰💰💰💰
- **Infraestructura**: $50-200 USD/mes por tenant (dependiendo de tamaño de RDS)
- Para 10 tenants: $500-2000 USD/mes solo en bases de datos
- **Operativo**: Alto costo de mantenimiento (DevOps dedicado)

#### Rendimiento

**Excelente** ⚡⚡⚡⚡⚡
- Sin contención entre tenants
- Cada tenant tiene recursos dedicados
- Consultas aisladas sin interferencia

#### Mantenimiento

**Complejo** 🔧🔧🔧🔧
- Requiere automatización avanzada
- Monitoreo de N bases de datos
- Backup y disaster recovery complejos
- Upgrades de PostgreSQL multiplicados por N

#### Caso de Uso Ideal

✅ **SI** usar cuando:
- Tenants son empresas grandes con datos masivos
- Cumplimiento regulatorio crítico
- SLA diferenciados por tenant
- Presupuesto amplio para infraestructura
- Pocos tenants (< 20) pero grandes

❌ **NO** usar cuando:
- Presupuesto limitado
- Muchos tenants pequeños (> 50)
- Equipo de DevOps pequeño
- Necesitas reporting cross-tenant frecuente

---

### ESTRATEGIA 2: SCHEMA POR TENANT (Schema-per-Tenant)

#### Descripción
Todos los tenants comparten la misma base de datos PostgreSQL, pero cada uno tiene su propio **schema** (namespace lógico). PostgreSQL permite múltiples schemas en una sola base de datos.

#### Arquitectura
```
Database: sanfer-platform-db
├── Schema: tenant_sanfer
│   ├── events
│   ├── event_users
│   └── ...
├── Schema: tenant_novartis
│   ├── events
│   ├── event_users
│   └── ...
└── Schema: tenant_msd
    ├── events
    ├── event_users
    └── ...

Schema: public (metadata compartida)
└── tenants (registro de tenants)
```

#### Implementación en NestJS

**1. Configuración de TypeORM con Schema Dinámico**
```typescript
// Middleware para establecer search_path
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = extractTenantFromRequest(req);
    const schemaName = `tenant_${tenantId}`;

    // Establecer search_path para esta request
    await connection.query(`SET search_path TO ${schemaName}`);
    next();
  }
}
```

**2. Gestión de Schemas**
```sql
-- Crear schema para nuevo tenant
CREATE SCHEMA tenant_sanfer;

-- Aplicar todas las tablas al schema
-- TypeORM migraciones con schema específico
```

#### Pros

| ✅ Ventaja | Descripción |
|-----------|-------------|
| **Buen aislamiento lógico** | Schemas separados reducen riesgo de queries cross-tenant. |
| **Una sola base de datos** | Más simple que múltiples bases de datos. |
| **Backups centralizados** | Un solo backup para toda la plataforma. |
| **Reporting cross-tenant más fácil** | Queries pueden unir schemas diferentes. |
| **Pool de conexiones eficiente** | Una sola pool de conexiones compartida. |
| **Costos menores que DB-per-Tenant** | Una instancia de RDS para todos. |
| **Migraciones centralizadas** | Una migración se aplica a todos los schemas. |

#### Cons

| ❌ Desventaja | Descripción |
|-------------|-------------|
| **Complejidad media-alta** | Gestionar `search_path` en cada request. |
| **Riesgo de fuga de datos** | Si `search_path` no se establece correctamente, queries pueden ir al schema incorrecto. |
| **Límite de schemas** | PostgreSQL puede manejar cientos, pero el rendimiento degrada con miles. |
| **Restauración granular limitada** | No puedes restaurar solo un tenant fácilmente. |
| **Recursos compartidos** | Todos los tenants comparten CPU, memoria, IOPS de la BD. |
| **No apto para compliance estricto** | GDPR/HIPAA puede requerir separación física. |
| **Tamaño de base de datos crece** | Todos los tenants suman al tamaño de una sola BD. |

#### Complejidad de Migración

**MEDIA-ALTA** 🟡

**Pasos requeridos:**
1. Crear schema `public` con tabla `tenants`
2. Crear schema `tenant_sanfer` con estructura completa
3. Implementar middleware para `SET search_path`
4. Migrar datos existentes a `tenant_sanfer`
5. Modificar todas las queries para ser schema-aware
6. Implementar sistema de creación de schemas para nuevos tenants
7. Actualizar migraciones para aplicarse a todos los schemas
8. Testing exhaustivo de aislamiento

**Tiempo estimado**: 3-5 semanas

#### Escalabilidad

**Buena** ⭐⭐⭐⭐
- Soporta 50-200 tenants cómodamente
- Escalabilidad limitada por recursos de la BD única
- Puede requerir sharding eventual

#### Costo

**MEDIO** 💰💰
- **Infraestructura**: $100-400 USD/mes para una RDS mediana-grande
- Escala mejor que DB-per-Tenant
- Costos de storage crecen linealmente

#### Rendimiento

**Bueno** ⚡⚡⚡⚡
- Mejor que shared database con tenant_id
- Índices optimizados por schema
- Overhead mínimo por `SET search_path`
- Riesgo de "noisy neighbor" si un tenant sobrecarga la BD

#### Mantenimiento

**Medio** 🔧🔧🔧
- Migraciones más simples que DB-per-Tenant
- Monitoreo de una sola BD
- Backups centralizados
- Requiere scripting para gestión de schemas

#### Caso de Uso Ideal

✅ **SI** usar cuando:
- 10-100 tenants de tamaño medio
- Balance entre aislamiento y costo
- Equipo técnico competente con PostgreSQL
- Reporting cross-tenant necesario
- Presupuesto moderado

❌ **NO** usar cuando:
- Compliance estricto requiere separación física
- Más de 200 tenants esperados
- Tenants con carga muy desigual (riesgo de "noisy neighbor")
- Equipo sin experiencia en gestión de schemas PostgreSQL

---

### ESTRATEGIA 3: BASE DE DATOS COMPARTIDA CON DISCRIMINADOR DE TENANT (Shared Database + tenant_id)

#### Descripción
Todos los tenants comparten la misma base de datos y las mismas tablas. Cada registro tiene una columna `tenant_id` que identifica a qué tenant pertenece. Todas las queries deben filtrar por `tenant_id`.

#### Arquitectura
```
Database: sanfer-platform-db

Table: tenants
+----+-------------+--------+
| id | tenant_key  | domain |
+----+-------------+--------+
| 1  | sanfer      | ...    |
| 2  | novartis    | ...    |
+----+-------------+--------+

Table: events
+----+-----------+----------+
| id | tenant_id | name     |
+----+-----------+----------+
| 1  | 1         | Evento A |
| 2  | 2         | Evento B |
+----+-----------+----------+

Table: event_users
+----+-----------+-------+-------+
| id | tenant_id | email | ...   |
+----+-----------+-------+-------+
| 1  | 1         | user1 | ...   |
| 2  | 2         | user1 | ...   | ← mismo email, diferente tenant
+----+-----------+-------+-------+
```

#### Implementación en NestJS

**1. Entidad Base con Tenant**
```typescript
// Base entity que todas las entidades extienden
@Entity()
export abstract class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}

// Ejemplo: Event entity
@Entity('events')
export class AppEvent extends TenantEntity {
  @Column()
  name: string;

  // ... resto de campos
  // NO necesita tenant_id, lo hereda de TenantEntity
}
```

**2. Global Scoped Query con Interceptor**
```typescript
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];

    // Establecer tenant en contexto de request
    AsyncLocalStorage.run({ tenantId }, () => {
      return next.handle();
    });
  }
}
```

**3. Repository Wrapper con Scope Automático**
```typescript
@Injectable()
export class TenantRepository<T extends TenantEntity> {
  constructor(
    private repository: Repository<T>,
    private tenantContext: TenantContextService,
  ) {}

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    const tenantId = this.tenantContext.getCurrentTenantId();
    return this.repository.find({
      ...options,
      where: {
        ...options?.where,
        tenantId,
      },
    });
  }

  // Similar para findOne, save, update, delete...
}
```

**4. Modificar Constraints de Unicidad**
```typescript
// Antes (global):
@Column({ unique: true })
email: string;

// Después (por tenant):
@Index('UQ_event_users_email_tenant', ['email', 'tenantId'], { unique: true })
@Column()
email: string;
```

#### Pros

| ✅ Ventaja | Descripción |
|-----------|-------------|
| **Simplicidad máxima** | Arquitectura más simple de entender y mantener. |
| **Costos mínimos** | Una sola base de datos para todos. $50-150/mes para empezar. |
| **Migraciones simples** | Una sola migración para todos los tenants. |
| **Reporting cross-tenant trivial** | Queries agregadas son directas (GROUP BY tenant_id). |
| **Onboarding instantáneo** | Agregar tenant = INSERT en tabla `tenants` (segundos). |
| **Pool de conexiones óptimo** | Una sola pool compartida eficientemente. |
| **Escalabilidad inicial excelente** | Perfecto para 5-50 tenants pequeños/medianos. |

#### Cons

| ❌ Desventaja | Descripción |
|-------------|-------------|
| **RIESGO CRÍTICO de fuga de datos** | Un solo bug en WHERE clause = exposición masiva de datos. |
| **Seguridad compleja** | Requiere disciplina estricta en TODAS las queries. |
| **Rendimiento degrada con escala** | Índices crecen masivamente, queries se vuelven lentas. |
| **No apto para compliance estricto** | GDPR/HIPAA requiere mayor aislamiento. |
| **"Noisy neighbor" severo** | Un tenant puede saturar la BD afectando a todos. |
| **Restauración granular imposible** | No puedes restaurar solo un tenant. |
| **Límite de escalabilidad** | Más de 100 tenants activos puede ser problemático. |
| **Requiere testing exhaustivo** | Cada query debe verificarse por tenant_id. |

#### Complejidad de Migración

**BAJA-MEDIA** 🟢

**Pasos requeridos:**
1. Crear entidad `Tenant` en base de datos
2. Agregar columna `tenant_id` a TODAS las tablas existentes (16 tablas)
3. Crear clase base `TenantEntity`
4. Modificar todas las entidades para extender `TenantEntity`
5. Crear tenant "Sanfer" y asignar `tenant_id=1` a todos los datos existentes
6. Actualizar constraints únicos para incluir `tenant_id`
7. Implementar `TenantInterceptor` o Middleware
8. Crear `TenantContextService` con AsyncLocalStorage
9. Modificar todos los servicios para usar tenant scope
10. Testing de aislamiento por tenant
11. Actualizar JWT para incluir `tenantId`

**Tiempo estimado**: 2-4 semanas

#### Escalabilidad

**Limitada** ⭐⭐⭐
- Óptimo para 5-50 tenants
- Viable hasta ~100 tenants con optimización
- Más allá requiere sharding o migración a otra estrategia

#### Costo

**MUY BAJO** 💰
- **Infraestructura**: $50-200 USD/mes (RDS pequeña/mediana)
- Más económico para comenzar
- Costos crecen lentamente

#### Rendimiento

**Variable** ⚡⚡⚡
- Excelente con < 50 tenants
- Degrada con escala (índices compuestos grandes)
- Requiere optimización cuidadosa de queries
- "Noisy neighbor" puede afectar a todos

#### Mantenimiento

**Simple** 🔧🔧
- Migraciones estándar
- Monitoreo de una sola BD
- Backups centralizados
- Requiere MUCHA disciplina en código

#### Caso de Uso Ideal

✅ **SI** usar cuando:
- Startup/MVP con presupuesto limitado
- 5-30 tenants pequeños
- Datos de bajo riesgo (no compliance crítico)
- Equipo pequeño de desarrollo
- Necesitas lanzar rápido

❌ **NO** usar cuando:
- Datos sensibles/regulados (salud, financiero)
- Más de 50 tenants activos
- Tenants con cargas muy desiguales
- SLA diferenciados por tenant
- Riesgo de fuga de datos es inaceptable

---

## 5. COMPARATIVA CONSOLIDADA

| Criterio | DB por Tenant 🔴 | Schema por Tenant 🟡 | Tenant ID 🟢 |
|----------|-----------------|---------------------|--------------|
| **Aislamiento de Datos** | Máximo (físico) | Alto (lógico) | Medio (lógico) |
| **Riesgo de Fuga** | Muy Bajo | Bajo | **ALTO** ⚠️ |
| **Complejidad Migración** | Alta (4-6 sem) | Media-Alta (3-5 sem) | Baja-Media (2-4 sem) |
| **Costo Infraestructura** | Alto ($500-2000) | Medio ($100-400) | Bajo ($50-200) |
| **Escalabilidad** | Ilimitada | 50-200 tenants | 5-100 tenants |
| **Rendimiento** | Excelente | Bueno | Variable |
| **Mantenimiento** | Complejo | Medio | Simple |
| **Reporting Cross-Tenant** | Difícil | Factible | Trivial |
| **Onboarding Nuevo Tenant** | Lento (horas) | Medio (minutos) | Instantáneo (segundos) |
| **Compliance GDPR/HIPAA** | Excelente | Aceptable | Limitado |
| **Personalización por Tenant** | Alta | Media | Baja |
| **Costo de Desarrollo** | Alto | Medio | Bajo |

---

## 6. RECOMENDACIÓN PARA SANFER-BACKEND

### 🏆 ESTRATEGIA RECOMENDADA: **SCHEMA POR TENANT (Estrategia 2)**

#### Justificación Detallada

Basándome en mi análisis del código y considerando los siguientes factores:

**1. Contexto del Negocio:**
- Clientes target: Empresas farmacéuticas grandes (Sanfer, Novartis, MSD)
- Datos sensibles: Información de empleados, encuestas, asistencia a eventos
- Expectativa de crecimiento: 10-30 clientes en 2-3 años
- Compliance: Industria farmacéutica requiere separación clara de datos

**2. Estado Actual del Código:**
- ✅ Código modular bien estructurado (facilita refactoring)
- ✅ TypeORM permite trabajar con schemas fácilmente
- ✅ Uso de PostgreSQL (excelente soporte de schemas)
- ❌ No hay concepto de tenant actualmente
- ❌ Constraints únicos que necesitan modificación

**3. Recursos y Capacidades:**
- Equipo técnico: Capaz de manejar complejidad media
- Presupuesto: Moderado (empresarial, no startup)
- Timeline: Suficiente para implementación robusta

### ¿Por qué NO Database-per-Tenant? 🔴

Aunque ofrece máximo aislamiento:
- ❌ **Overkill para 10-30 tenants**: La complejidad operativa no se justifica
- ❌ **Costos excesivos**: $500-2000/mes es innecesario para este volumen
- ❌ **Complejidad de migraciones**: Aplicar cambios a 20+ bases de datos es problemático
- ❌ **Reporting limitado**: Difícil hacer analytics cross-tenant

**Reservar para**: Si Sanfer crece a 100+ clientes o algún cliente requiere aislamiento físico por contrato.

### ¿Por qué NO Tenant ID? 🟢

Aunque es más simple:
- ❌ **Riesgo inaceptable**: Un bug en WHERE puede exponer datos de Novartis a MSD
- ❌ **Compliance**: La industria farmacéutica tiene regulaciones estrictas
- ❌ **Reputación**: Una fuga de datos destruiría la confianza de clientes empresariales
- ❌ **Testing costoso**: Requiere verificar TODAS las queries constantemente

**Reservar para**: MVPs, SaaS B2C con datos no sensibles, startups con presupuesto muy limitado.

### ¿Por qué SÍ Schema-per-Tenant? 🟡 ✅

**Balance óptimo** entre seguridad, costo y mantenibilidad:

✅ **Seguridad Robusta**:
- Schemas PostgreSQL proveen aislamiento lógico fuerte
- `SET search_path` reduce drásticamente riesgo de cross-tenant queries
- Cumple requisitos de compliance para industria farmacéutica

✅ **Costos Razonables**:
- Una instancia RDS de $150-400/mes soporta 30+ tenants cómodamente
- Escala mejor que DB-per-Tenant
- ROI excelente para base de clientes target

✅ **Operacionalmente Manejable**:
- Migraciones centralizadas con loop sobre schemas
- Un solo backup/restore
- Monitoreo de una base de datos

✅ **Rendimiento Adecuado**:
- Cada schema tiene sus propios índices optimizados
- Menor overhead que tenant_id en queries complejas
- Soporta 50-200 tenants antes de necesitar optimización

✅ **Reporting Posible**:
- Analytics cross-tenant son factibles (`SELECT ... FROM tenant_sanfer.events UNION ...`)
- Más flexible que DB-per-Tenant

---

## 7. HOJA DE RUTA DE IMPLEMENTACIÓN (Schema-per-Tenant)

### FASE 1: Diseño y Preparación (Semana 1)

**Objetivos:**
- Definir modelo de datos de tenant
- Diseñar estrategia de identificación de tenant
- Planificar cambios en autenticación

**Tareas:**

1. **Crear Entidad Tenant**
   - **Archivo**: `src/tenant/entities/tenant.entity.ts`
   ```typescript
   @Entity({ name: 'tenants', schema: 'public' })
   export class Tenant {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     @Column({ unique: true })
     tenantKey: string; // 'sanfer', 'novartis'

     @Column({ unique: true })
     domain: string; // 'sanfer.api.com'

     @Column()
     name: string; // 'Laboratorios Sanfer'

     @Column()
     schemaName: string; // 'tenant_sanfer'

     @Column({ default: true })
     isActive: boolean;

     @CreateDateColumn()
     createdAt: Date;
   }
   ```

2. **Definir Estrategia de Identificación**
   - **Opción Recomendada**: Subdominio + Fallback a Header
   - `sanfer.api.sanferapp.com` → tenantKey='sanfer'
   - Header `X-Tenant-ID: sanfer` como fallback

3. **Actualizar JWT Payload**
   ```typescript
   // Incluir tenantId en todos los tokens
   const payload = {
     sub: usuario.id,
     email: usuario.email,
     rol: usuario.rol,
     tenantId: usuario.tenantId, // NUEVO
   };
   ```

### FASE 2: Infraestructura de Tenant (Semana 2)

**Objetivos:**
- Implementar servicios de gestión de tenant
- Crear middleware de tenant context
- Configurar TypeORM para schemas dinámicos

**Tareas:**

1. **TenantModule**
   ```
   src/tenant/
   ├── tenant.module.ts
   ├── tenant.service.ts
   ├── tenant.controller.ts
   ├── entities/tenant.entity.ts
   ├── dto/create-tenant.dto.ts
   └── tenant-context.service.ts
   ```

2. **TenantContextService** (AsyncLocalStorage)
   ```typescript
   @Injectable()
   export class TenantContextService {
     private readonly asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

     run<T>(tenantId: string, callback: () => T): T {
       return this.asyncLocalStorage.run({ tenantId }, callback);
     }

     getCurrentTenantId(): string {
       const context = this.asyncLocalStorage.getStore();
       if (!context) throw new Error('No tenant context');
       return context.tenantId;
     }
   }
   ```

3. **TenantMiddleware**
   ```typescript
   @Injectable()
   export class TenantMiddleware implements NestMiddleware {
     constructor(
       private tenantService: TenantService,
       private dataSource: DataSource,
     ) {}

     async use(req: Request, res: Response, next: NextFunction) {
       // 1. Identificar tenant
       const tenantKey = this.extractTenant(req);

       // 2. Obtener configuración de tenant
       const tenant = await this.tenantService.findByKey(tenantKey);
       if (!tenant || !tenant.isActive) {
         throw new UnauthorizedException('Invalid tenant');
       }

       // 3. Establecer search_path
       await this.dataSource.query(
         `SET search_path TO ${tenant.schemaName}, public`
       );

       // 4. Guardar en request
       req['tenant'] = tenant;

       next();
     }

     private extractTenant(req: Request): string {
       // De subdominio: sanfer.api.com → 'sanfer'
       const host = req.headers.host || '';
       const subdomain = host.split('.')[0];

       // Fallback a header
       return subdomain || req.headers['x-tenant-id'] as string;
     }
   }
   ```

4. **Aplicar Middleware Globalmente**
   ```typescript
   // app.module.ts
   export class AppModule implements NestModule {
     configure(consumer: MiddlewareConsumer) {
       consumer
         .apply(TenantMiddleware)
         .forRoutes('*');
     }
   }
   ```

### FASE 3: Migración de Esquema (Semana 2-3)

**Objetivos:**
- Crear script para generar schemas por tenant
- Migrar datos existentes a schema de Sanfer

**Tareas:**

1. **Script de Creación de Schema**
   ```typescript
   // scripts/create-tenant-schema.ts
   export async function createTenantSchema(
     dataSource: DataSource,
     tenantKey: string,
   ): Promise<void> {
     const schemaName = `tenant_${tenantKey}`;

     // 1. Crear schema
     await dataSource.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

     // 2. Aplicar todas las migraciones al schema
     await dataSource.query(`SET search_path TO ${schemaName}`);

     // 3. Ejecutar migraciones
     await dataSource.runMigrations({ transaction: 'all' });
   }
   ```

2. **Migrar Datos Existentes**
   ```sql
   -- 1. Crear schema para Sanfer
   CREATE SCHEMA tenant_sanfer;

   -- 2. Copiar todas las tablas
   CREATE TABLE tenant_sanfer.events AS TABLE public.events;
   CREATE TABLE tenant_sanfer.event_users AS TABLE public.event_users;
   -- ... repetir para todas las 16 tablas

   -- 3. Recrear constraints y relaciones
   ALTER TABLE tenant_sanfer.events
     ADD CONSTRAINT pk_events PRIMARY KEY (id);

   -- 4. Recrear índices
   CREATE UNIQUE INDEX idx_events_name
     ON tenant_sanfer.events(name);

   -- ... etc.
   ```

3. **Modificar Configuración de TypeORM**
   ```typescript
   // app.module.ts
   TypeOrmModule.forRootAsync({
     useFactory: () => ({
       type: 'postgres',
       host: process.env.DB_HOST,
       port: parseInt(process.env.DB_PORT),
       username: process.env.DB_USERNAME,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
       autoLoadEntities: true,
       synchronize: false, // ⚠️ CRÍTICO: Cambiar a false
       // NO especificar schema aquí (se maneja por middleware)
     }),
   })
   ```

### FASE 4: Actualización de Entidades (Semana 3)

**Objetivos:**
- Todas las entidades sean schema-aware
- Eliminar constraints únicos globales

**Tareas:**

1. **Actualizar Entidad Event**
   ```typescript
   // src/event/entities/event.entity.ts
   @Entity({ name: 'events' })
   export class AppEvent {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     // ANTES: @Column({ unique: true })
     // DESPUÉS: Unique solo dentro del schema (manejado por schema)
     @Column()
     name: string;

     // ... resto de campos sin cambios
   }
   ```

2. **Actualizar Entidad EventUser**
   ```typescript
   @Entity({ name: 'event_users' })
   export class EventUser {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     // ANTES: @Column({ unique: true })
     // DESPUÉS: Unique dentro del schema
     @Column()
     @IsEmail()
     email: string;

     // ... resto sin cambios
   }
   ```

3. **Actualizar Entidad Usuario (Administradores)**
   - **Decisión Crítica**: ¿Los admins son globales o por tenant?

   **Opción A - Admins por Tenant (Recomendado):**
   ```typescript
   @Entity({ name: 'usuarios' })
   export class Usuario {
     // Mover a schema del tenant
     // Cada tenant gestiona sus propios admins
   }
   ```

   **Opción B - Admins Globales:**
   ```typescript
   @Entity({ name: 'usuarios', schema: 'public' })
   export class Usuario {
     @Column()
     tenantId: string; // Relación con tenant

     @ManyToOne(() => Tenant)
     tenant: Tenant;

     // Un admin puede acceder a su tenant asignado
   }
   ```

   **Recomendación**: Opción A (por tenant) para mayor autonomía de clientes.

### FASE 5: Actualización de Servicios (Semana 3-4)

**Objetivos:**
- Todos los servicios respetan el schema actual
- Queries automáticamente van al schema correcto

**Tareas:**

1. **Verificar Servicios**
   - La mayoría de servicios NO requieren cambios
   - TypeORM usa automáticamente el `search_path` establecido por middleware

   **Ejemplo - EventService (sin cambios necesarios):**
   ```typescript
   // src/event/event.service.ts
   async findAll(): Promise<AppEvent[]> {
     // Esta query automáticamente va a tenant_X.events
     // gracias al search_path establecido por middleware
     return await this.eventRepository.find({
       relations: ['groups', 'appMenu'],
       order: { startDate: 'ASC' },
     });
   }
   ```

2. **Casos Especiales - Queries con JOIN a public**
   ```typescript
   // Si necesitas acceder a tabla public.tenants
   const result = await this.dataSource.query(`
     SELECT e.*, t.name as tenant_name
     FROM events e
     CROSS JOIN public.tenants t
     WHERE t.id = current_setting('app.current_tenant_id')
   `);
   ```

### FASE 6: Actualización de Autenticación (Semana 4)

**Objetivos:**
- JWT incluye tenantId
- Guards validan tenant

**Tareas:**

1. **Modificar UsuariosService**
   ```typescript
   // src/usuarios/usuarios.service.ts
   async login(loginDto: LoginUsuarioDto, tenantId: string) {
     // 1. Buscar usuario en schema del tenant actual
     const usuario = await this.usuarioRepository.findOne({
       where: { email: loginDto.email, activo: true },
     });

     // 2. Incluir tenantId en JWT
     const payload = {
       sub: usuario.id,
       email: usuario.email,
       rol: usuario.rol,
       tenantId: tenantId, // NUEVO
     };

     const accessToken = this.jwtService.sign(payload);
     // ...
   }
   ```

2. **Modificar EventUserAuthService (similar)**
   ```typescript
   async login(loginDto: LoginEventUserDto, tenantId: string) {
     const payload = {
       sub: user.id,
       email: user.email,
       type: 'event-user',
       tenantId: tenantId, // NUEVO
     };
   }
   ```

3. **Actualizar Guards**
   ```typescript
   // src/common/guards/auth.guard.ts
   @Injectable()
   export class JwtAuthGuard extends PassportAuthGuard('jwt') {
     canActivate(context: ExecutionContext) {
       return super.canActivate(context);
     }

     handleRequest(err, user, info, context) {
       const request = context.switchToHttp().getRequest();

       // Validar que el tenantId del JWT coincide con el tenant del request
       if (user?.tenantId !== request.tenant?.id) {
         throw new UnauthorizedException('Tenant mismatch');
       }

       return user;
     }
   }
   ```

### FASE 7: Testing y Validación (Semana 5)

**Objetivos:**
- Verificar aislamiento entre tenants
- Testing de seguridad exhaustivo

**Tareas:**

1. **Tests de Aislamiento**
   ```typescript
   // test/multi-tenant.e2e-spec.ts
   describe('Multi-Tenant Isolation', () => {
     it('tenant A cannot access tenant B events', async () => {
       // 1. Crear evento en tenant_sanfer
       const event = await createEvent('sanfer', { name: 'Evento Sanfer' });

       // 2. Intentar acceder desde tenant_novartis
       const response = await request(app)
         .get(`/event/${event.id}`)
         .set('X-Tenant-ID', 'novartis')
         .expect(404); // No debe encontrarlo
     });

     it('same email can exist in different tenants', async () => {
       await createUser('sanfer', { email: 'user@test.com' });
       await createUser('novartis', { email: 'user@test.com' });
       // No debe fallar
     });
   });
   ```

2. **Security Audit**
   - Revisar TODOS los endpoints
   - Verificar que ninguna query pueda saltar schemas
   - Testing de penetración básico

3. **Performance Testing**
   - Cargar datos de prueba en múltiples schemas
   - Medir latencia de queries
   - Verificar que `SET search_path` no impacta performance

### FASE 8: Deployment y Onboarding (Semana 5-6)

**Objetivos:**
- Documentar proceso de onboarding
- Crear herramientas de administración

**Tareas:**

1. **CLI para Gestión de Tenants**
   ```bash
   # Crear nuevo tenant
   npm run tenant:create -- --key=novartis --name="Novartis"

   # Listar tenants
   npm run tenant:list

   # Eliminar tenant (soft delete)
   npm run tenant:delete -- --key=novartis
   ```

2. **Script de Onboarding**
   ```typescript
   // scripts/onboard-tenant.ts
   async function onboardTenant(tenantKey: string, name: string) {
     // 1. Crear registro en public.tenants
     const tenant = await tenantRepo.save({
       tenantKey,
       name,
       schemaName: `tenant_${tenantKey}`,
       domain: `${tenantKey}.api.sanferapp.com`,
     });

     // 2. Crear schema
     await createTenantSchema(dataSource, tenantKey);

     // 3. Crear usuario admin inicial
     await createAdminUser(tenantKey, {
       email: `admin@${tenantKey}.com`,
       password: generateSecurePassword(),
       rol: 'admin',
     });

     // 4. Enviar email de bienvenida
     await sendWelcomeEmail(tenant);

     console.log(`✅ Tenant ${name} creado exitosamente`);
   }
   ```

3. **Documentación**
   - Guía de arquitectura multi-tenant
   - Proceso de onboarding de clientes
   - Troubleshooting común
   - Guía de desarrollo (cómo agregar nuevas features)

### FASE 9: Monitoreo y Optimización (Continuo)

**Objetivos:**
- Monitoreo por tenant
- Optimización de performance

**Tareas:**

1. **Métricas por Tenant**
   - Queries ejecutadas por tenant
   - Tamaño de storage por schema
   - Latencia promedio por tenant

2. **Alertas**
   - Schema crece demasiado rápido
   - Queries lentas en un tenant específico
   - Fallas de autenticación por tenant

3. **Dashboard de Admin**
   - Ver todos los tenants activos
   - Estadísticas de uso por tenant
   - Gestión de configuración

---

## 8. CONSIDERACIONES CRÍTICAS

### 8.1 Seguridad

**Riesgos a Mitigar:**

1. **Schema Leakage**
   - **Riesgo**: Query accidental a schema incorrecto
   - **Mitigación**:
     - Middleware robusto que SIEMPRE establece `search_path`
     - Testing exhaustivo de aislamiento
     - Code review enfocado en queries

2. **Tenant Impersonation**
   - **Riesgo**: Usuario modifica header `X-Tenant-ID` para acceder a otro tenant
   - **Mitigación**:
     - Validar tenantId del JWT contra tenant del request
     - No confiar solo en headers (usar subdominio preferentemente)
     - Guards que validen coincidencia

3. **SQL Injection con Schema Names**
   - **Riesgo**: Inyección en `SET search_path TO ${schemaName}`
   - **Mitigación**:
     - Whitelist de schema names permitidos
     - Validar formato: `^tenant_[a-z0-9_]+$`
     - Usar prepared statements

**Recomendaciones:**

```typescript
// ✅ CORRECTO
const allowedSchemas = ['tenant_sanfer', 'tenant_novartis'];
if (!allowedSchemas.includes(schemaName)) {
  throw new Error('Invalid schema');
}
await connection.query(`SET search_path TO ${schemaName}`);

// ❌ INCORRECTO
const schemaName = req.headers['x-tenant-id']; // ¡Nunca!
await connection.query(`SET search_path TO ${schemaName}`);
```

### 8.2 Performance

**Optimizaciones Recomendadas:**

1. **Connection Pooling Eficiente**
   ```typescript
   TypeOrmModule.forRoot({
     // ...
     extra: {
       max: 20, // Pool size
       min: 5,
       idleTimeoutMillis: 30000,
     },
   })
   ```

2. **Índices por Schema**
   - Cada schema debe tener sus propios índices optimizados
   - Monitorear `pg_stat_user_indexes` por schema

3. **Caché de Tenant Configuration**
   ```typescript
   @Injectable()
   export class TenantService {
     private tenantCache = new Map<string, Tenant>();

     async findByKey(key: string): Promise<Tenant> {
       if (this.tenantCache.has(key)) {
         return this.tenantCache.get(key);
       }

       const tenant = await this.tenantRepo.findOne({ where: { tenantKey: key } });
       this.tenantCache.set(key, tenant);
       return tenant;
     }
   }
   ```

4. **Query Optimization**
   - Usar `EXPLAIN ANALYZE` para queries lentas
   - Índices compuestos donde sea necesario
   - Evitar N+1 queries (usar `relations` en TypeORM)

### 8.3 Backups y Disaster Recovery

**Estrategia de Backups:**

1. **Backup Completo de Base de Datos**
   - Frecuencia: Diario (3 AM)
   - Retención: 30 días
   - Incluye todos los schemas

2. **Backup por Schema (Opcional)**
   ```bash
   # Backup de un tenant específico
   pg_dump -n tenant_sanfer -h localhost -U postgres sanfer-platform-db \
     > backup_sanfer_$(date +%Y%m%d).sql
   ```

3. **Point-in-Time Recovery**
   - Habilitar WAL archiving
   - Permite restaurar a cualquier momento

**Plan de Recuperación:**

1. **Restauración Completa**
   ```bash
   psql -h localhost -U postgres -d sanfer-platform-db \
     < backup_full_20250115.sql
   ```

2. **Restauración de un Solo Tenant**
   ```bash
   # Eliminar schema corrupto
   DROP SCHEMA tenant_sanfer CASCADE;

   # Restaurar desde backup
   psql -h localhost -U postgres -d sanfer-platform-db \
     < backup_sanfer_20250115.sql
   ```

### 8.4 Migraciones de Base de Datos

**Proceso de Migraciones Multi-Tenant:**

```typescript
// migrations/run-all-tenants.ts
export async function runMigrationForAllTenants(dataSource: DataSource) {
  const tenants = await dataSource
    .getRepository(Tenant)
    .find({ where: { isActive: true } });

  for (const tenant of tenants) {
    try {
      console.log(`Running migrations for ${tenant.tenantKey}...`);

      // Establecer search_path
      await dataSource.query(`SET search_path TO ${tenant.schemaName}`);

      // Ejecutar migraciones
      await dataSource.runMigrations({ transaction: 'all' });

      console.log(`✅ ${tenant.tenantKey} migrated successfully`);
    } catch (error) {
      console.error(`❌ Error migrating ${tenant.tenantKey}:`, error);
      // Decidir: continuar o detener
    }
  }
}
```

**Rollback Strategy:**

```bash
# Si una migración falla en un tenant
# 1. Identificar el schema afectado
# 2. Revertir solo ese schema
SET search_path TO tenant_novartis;
-- Ejecutar rollback SQL manualmente

# 3. Reintentar migración cuando esté corregida
```

### 8.5 Monitoreo y Observabilidad

**Métricas Clave:**

1. **Por Tenant:**
   - Número de queries/segundo
   - Latencia promedio de queries
   - Tamaño de storage (MB)
   - Usuarios activos

2. **Global:**
   - Connection pool utilization
   - Queries lentas (> 1s)
   - Errores de autenticación
   - Fallas de `SET search_path`

**Herramientas Recomendadas:**

- **Logging**: Winston con contexto de tenant
- **APM**: New Relic o Datadog con tags por tenant
- **Database Monitoring**: pgAdmin + pg_stat_statements

---

## 9. COSTOS ESTIMADOS

### Infraestructura (AWS/GCP/Azure)

**Escenario: 20 Tenants Activos**

| Componente | Especificación | Costo Mensual |
|------------|----------------|---------------|
| RDS PostgreSQL | db.r5.large (2 vCPU, 16GB RAM) | $220 USD |
| Storage | 500 GB SSD | $115 USD |
| Backups | 500 GB (retención 30 días) | $50 USD |
| Data Transfer | 100 GB outbound | $9 USD |
| **TOTAL** | | **~$394 USD/mes** |

**Escalabilidad:**

- **50 Tenants**: db.r5.xlarge → ~$600 USD/mes
- **100 Tenants**: db.r5.2xlarge → ~$1,100 USD/mes

### Desarrollo

| Fase | Tiempo | Costo (@ $80/hr) |
|------|--------|------------------|
| Diseño y Preparación | 40 hrs | $3,200 |
| Infraestructura de Tenant | 60 hrs | $4,800 |
| Migración de Esquema | 40 hrs | $3,200 |
| Actualización de Código | 60 hrs | $4,800 |
| Testing y QA | 40 hrs | $3,200 |
| Documentación | 20 hrs | $1,600 |
| **TOTAL** | **260 hrs** | **~$20,800 USD** |

### Mantenimiento Anual

| Concepto | Costo Anual |
|----------|-------------|
| Infraestructura (promedio) | $7,000 USD |
| Monitoreo y Tooling | $1,200 USD |
| Soporte técnico (10% desarrollo) | $2,000 USD |
| **TOTAL** | **~$10,200 USD/año** |

---

## 10. RIESGOS Y PLAN DE MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Fuga de datos entre tenants** | Baja | Crítico | Testing exhaustivo, code reviews, security audit |
| **Falla en migración de schema** | Media | Alto | Backups antes de migrar, rollback plan, testing en staging |
| **Performance degradada con escala** | Media | Medio | Monitoreo continuo, índices optimizados, plan de sharding futuro |
| **Complejidad operativa** | Alta | Medio | Automatización, documentación, training del equipo |
| **Costos superiores a lo estimado** | Baja | Medio | Monitoreo de costos, optimización de queries, auto-scaling |
| **Bugs en identificación de tenant** | Media | Crítico | Testing E2E, validación en guards, logging detallado |

---

## 11. CONCLUSIÓN Y PRÓXIMOS PASOS

### Resumen

La arquitectura **Schema-per-Tenant** ofrece el mejor balance para Sanfer-Backend entre:
- ✅ Seguridad y aislamiento de datos robusto
- ✅ Costos operativos razonables
- ✅ Complejidad manejable
- ✅ Escalabilidad hasta 50-200 tenants
- ✅ Cumplimiento de compliance para industria farmacéutica

### Próximos Pasos Inmediatos

1. **Aprobación Ejecutiva**
   - Presentar este análisis a stakeholders
   - Aprobar presupuesto (~$20,800 desarrollo + $394/mes infraestructura)
   - Definir timeline (6 semanas de desarrollo)

2. **Preparación Técnica**
   - Configurar entorno de staging
   - Crear backups completos de producción actual
   - Configurar repositorio de código en rama `feature/multi-tenant`

3. **Kick-off de Desarrollo**
   - Semana 1: Diseño detallado y POC
   - Semanas 2-4: Implementación core
   - Semana 5: Testing y validación
   - Semana 6: Documentación y deployment

4. **Plan de Rollout**
   - **Fase 1**: Migrar Sanfer a `tenant_sanfer` (usuario piloto)
   - **Fase 2**: Onboarding de segundo cliente (validar proceso)
   - **Fase 3**: Escala a clientes adicionales

### Recomendaciones Finales

1. **No subestimar Testing**: Invertir al menos 40 horas en pruebas de aislamiento
2. **Documentar exhaustivamente**: El equipo debe entender el nuevo modelo
3. **Automatizar onboarding**: Herramientas CLI desde el día 1
4. **Monitorear desde el inicio**: Métricas por tenant son críticas
5. **Plan de contingencia**: Tener rollback plan por si algo falla

**El código actual está bien estructurado y preparado para esta evolución. Con disciplina en la implementación, Sanfer-Backend estará listo para escalar a múltiples clientes corporativos de manera segura y eficiente.**

---

## ANEXOS

### A. Archivos Críticos a Modificar

```
CREAR NUEVOS:
├── src/tenant/
│   ├── tenant.module.ts
│   ├── tenant.service.ts
│   ├── tenant.controller.ts
│   ├── tenant-context.service.ts
│   ├── middleware/tenant.middleware.ts
│   ├── entities/tenant.entity.ts
│   └── dto/create-tenant.dto.ts
├── scripts/
│   ├── create-tenant-schema.ts
│   ├── onboard-tenant.ts
│   └── migrate-all-tenants.ts

MODIFICAR:
├── src/app.module.ts (agregar TenantModule, middleware)
├── src/usuarios/
│   ├── usuarios.service.ts (incluir tenantId en JWT)
│   ├── entities/usuario.entity.ts (decidir si es por tenant o global)
│   └── usuarios.controller.ts (validar tenant)
├── src/event-user/
│   ├── event-user-auth.service.ts (incluir tenantId)
│   └── guards/event-user-auth.guard.ts (validar tenant)
├── src/common/guards/
│   └── auth.guard.ts (validar tenant mismatch)
├── src/event/entities/event.entity.ts (remover unique constraint)
├── src/event-user/entities/event-user.entity.ts (remover unique constraint)
└── .env (actualizar configuración de BD)

NO MODIFICAR (funcionan automáticamente):
├── src/event/event.service.ts
├── src/survey/survey.service.ts
├── src/event-agenda/event-agenda.service.ts
└── ... (mayoría de servicios)
```

### B. Comandos Útiles

```bash
# Crear nuevo tenant
npm run tenant:create -- --key=novartis --name="Novartis" --domain="novartis.api.com"

# Listar schemas existentes
psql -h localhost -U postgres -d sanfer-platform-db -c "\dn+"

# Ver tablas en un schema específico
psql -h localhost -U postgres -d sanfer-platform-db -c "\dt tenant_sanfer.*"

# Ejecutar migraciones para todos los tenants
npm run migration:run:all-tenants

# Backup de un tenant
pg_dump -n tenant_sanfer -h localhost -U postgres sanfer-platform-db > backup_sanfer.sql

# Monitorear queries por schema
SELECT schemaname, count(*)
FROM pg_stat_user_tables
GROUP BY schemaname;
```

---

**Fin del Análisis**

Este análisis proporciona una guía completa para transformar sanfer-backend de single-tenant a multi-tenant usando la estrategia de Schema-per-Tenant, balanceando seguridad, costos y mantenibilidad para el contexto específico de Laboratorios Sanfer y sus clientes farmacéuticos objetivo.
