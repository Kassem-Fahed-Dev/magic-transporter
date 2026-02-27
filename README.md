# Magic Transporters API

A production-ready REST API for managing Magic Movers and their missions. Magic Movers are entities that carry Magic Items on quests, powered by virtual magic. The system implements a complete state machine lifecycle with comprehensive tracking, atomic operations, and robust error handling.

## 📋 Table of Contents

*   [Features](#-features)
*   [Tech Stack](#-tech-stack)
*   [Project Structure](#-project-structure)
*   [Getting Started](#-getting-started)
*   [API Documentation](#-api-documentation)
*   [Database Schema](#-database-schema)
*   [Architecture](#-architecture)
*   [Testing](#-testing)
*   [Error Handling](#-error-handling)
*   [Docker Deployment](#-docker-deployment)

## ✨ Features

### Magic Movers Management

*   **Create Movers** with name and weight capacity limits
*   **Load Items** onto movers with atomic weight validation
*   **Mission Lifecycle** - Complete state machine implementation (resting → loading → on-mission → resting)
*   **Top Movers Leaderboard** - Sort by missions completed
*   **Advanced Filtering** - Filter by quest state, mission count, weight limits
*   **Pagination & Sorting** - Flexible query options for all list endpoints

### Magic Items Management

*   **Create Items** with name and weight attributes
*   **Assignment Tracking** - Track which mover owns each item
*   **Availability Filtering** - Find assigned/unassigned items
*   **Weight Range Queries** - Filter items by weight
*   **Name Search** - Case-insensitive substring matching

### Activity Logging & Audit Trail

*   **Complete Activity History** - Track all mover state transitions
*   **Per-Mover Logs** - View activity history for specific movers
*   **Action Filtering** - Filter by action type (resting, loading, on-mission)
*   **Date Range Queries** - Filter logs by time period
*   **Item Snapshots** - Capture items involved in each action

### Enterprise Features

*   **Race Condition Protection** - Atomic database operations prevent conflicts
*   **Comprehensive Validation** - Input validation with detailed error messages
*   **API Documentation** - Interactive Swagger UI
*   **Health Checks** - Docker-ready health monitoring
*   **Structured Error Handling** - Consistent error response format

## 🛠 Tech Stack

| Category | Technology | Version |
| --- | --- | --- |
| **Runtime** | Node.js | 20+ |
| **Language** | TypeScript | 5.9+ (strict mode) |
| **Web Framework** | Express.js | 5.2 |
| **Database** | MongoDB | 7 |
| **ODM** | Mongoose | 9.2 |
| **DI Container** | tsyringe | 4.10 |
| **Validation** | express-validator | 7.3 |
| **API Docs** | Swagger (OpenAPI 3.0) | \- |
| **Testing** | Jest + Supertest | 30.2 / 7.2 |
| **Test DB** | mongodb-memory-server | 11.0 |
| **Containerization** | Docker & Docker Compose | \- |
| **Process Manager** | dumb-init | \- |

## 📁 Project Structure

```
magic-transporter/
├── src/
│   ├── app.ts                      # Express app setup
│   ├── server.ts                   # Entry point with DB connection
│   │
│   ├── config/
│   │   ├── index.ts                # Environment configuration
│   │   ├── database.ts             # MongoDB connection logic
│   │   ├── container.ts            # Dependency injection setup
│   │   └── swagger.ts              # OpenAPI 3.0 specification
│   │
│   ├── models/                     # Mongoose schemas & TypeScript interfaces
│   │   ├── magic-mover.model.ts
│   │   ├── magic-item.model.ts
│   │   └── activity-log.model.ts
│   │
│   ├── controllers/                # HTTP request/response handlers
│   │   ├── mover.controller.ts
│   │   ├── item.controller.ts
│   │   └── log.controller.ts
│   │
│   ├── services/                   # Business logic layer
│   │   ├── mover.service.ts
│   │   ├── item.service.ts
│   │   └── log.service.ts
│   │
│   ├── repositories/               # Data access layer
│   │   ├── mover.repository.ts
│   │   ├── item.repository.ts
│   │   └── log.repository.ts
│   │
│   ├── routes/                     # Express routes with Swagger docs
│   │   ├── mover.routes.ts
│   │   ├── item.routes.ts
│   │   └── log.routes.ts
│   │
│   ├── middleware/
│   │   ├── error-handler.ts        # Global error handling
│   │   └── validate.ts             # Validation middleware
│   │
│   ├── errors/                     # Custom error classes
│   │   ├── AppError.ts
│   │   ├── NotFoundError.ts
│   │   ├── BadRequestError.ts
│   │   ├── ValidationError.ts
│   │   ├── ConflictError.ts
│   │   └── ...
│   │
│   ├── validators/                 # Input validation rules
│   │   ├── mover.validators.ts
│   │   ├── item.validators.ts
│   │   └── log.validators.ts
│   │
│   ├── types/
│   │   └── enums.ts                # QuestState enum
│   │
│   └── utils/
│       └── response.ts             # Response utilities
│
├── tests/
│   ├── setup.ts                    # Test environment setup
│   ├── magic-movers.test.ts        # Mover tests
│   ├── magic-items.test.ts         # Item tests
│   └── e2e-full-workflow.test.ts   # End-to-end workflow tests
│
├── Dockerfile                      # Multi-stage production build
├── docker-compose.yml              # App + MongoDB services
├── jest.config.ts                  # Jest configuration
├── tsconfig.json                   # TypeScript config
└── .env.example                    # Environment template
```

## 🚀 Getting Started

### Prerequisites

*   **Node.js** >= 20
*   **MongoDB** >= 7 (local installation or Docker)
*   **npm** or **yarn**

### Installation

```

# Install dependencies
npm install
```

### Environment Variables

Edit `.env` file with your configuration:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/magic-transporters

# Docker-Specific (when using docker-compose)
MONGO_USER=admin
MONGO_PASSWORD=changeme
# MONGO_PORT=27017  # Uncomment for external MongoDB access
```

### Running Locally

```
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The API will be available at `http://localhost:3000`

### Running with Docker

```
# Start both API and MongoDB
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

**Docker Features:**

*   Multi-stage builds for optimized image size
*   Non-root user for security (nodejs:nodejs)
*   Health checks for both app and MongoDB
*   Resource limits (CPU and memory)
*   Persistent MongoDB data volumes
*   Automatic restart policies

## 📚 API Documentation

### Interactive Documentation

Once the server is running, visit:

**🔗** [**http://localhost:3000/api-docs**](http://localhost:3000/api-docs)

Interactive Swagger UI with:

*   All endpoints documented
*   Request/response schemas
*   Try-it-out functionality
*   Example payloads

### API Endpoints

#### Health Check

```
GET /health
```

Returns server health status.

#### Magic Movers (`/api/magic-movers`)

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/magic-movers` | Create a new mover |
| **GET** | `/api/magic-movers` | List all movers with filters |
| **GET** | `/api/magic-movers/top-movers` | Leaderboard by missions completed |
| **POST** | `/api/magic-movers/:id/load` | Load items onto a mover |
| **PUT** | `/api/magic-movers/:id/start-mission` | Start a mission |
| **PUT** | `/api/magic-movers/:id/end-mission` | End mission and unload items |

**Query Parameters for GET /api/magic-movers:**

*   `questState` - Filter by state (resting, loading, on-mission)
*   `minMissions`, `maxMissions` - Filter by mission count range
*   `minWeightLimit`, `maxWeightLimit` - Filter by weight capacity
*   `sortBy` - Sort field (missionsCompleted, weightLimit, currentWeight, createdAt)
*   `sortOrder` - Sort direction (asc, desc)
*   `limit` - Results per page (1-100)
*   `offset` - Skip N results (for pagination)

#### Magic Items (`/api/magic-items`)

| Method | Endpoint | Description |
| --- | --- | --- |
| **POST** | `/api/magic-items` | Create a new item |
| **GET** | `/api/magic-items` | List all items with filters |

**Query Parameters for GET /api/magic-items:**

*   `available` - Filter by availability (true = unassigned, false = assigned)
*   `minWeight`, `maxWeight` - Filter by weight range
*   `name` - Case-insensitive name search
*   `sortBy` - Sort field (name, weight, createdAt)
*   `sortOrder` - Sort direction (asc, desc)
*   `limit` - Results per page (1-100)
*   `offset` - Skip N results

#### Activity Logs (`/api/activity-logs`)

| Method | Endpoint | Description |
| --- | --- | --- |
| **GET** | `/api/activity-logs` | List all activity logs |
| **GET** | `/api/activity-logs/mover/:moverId` | List logs for specific mover |

**Query Parameters:**

*   `action` - Filter by action type (resting, loading, on-mission)
*   `startDate`, `endDate` - Filter by date range (ISO 8601 format)
*   `sortOrder` - Sort by timestamp (asc, desc, default: desc)
*   `limit` - Results per page (1-100)
*   `offset` - Skip N results

### Request/Response Examples

#### Create a Magic Mover

```
POST /api/magic-movers
Content-Type: application/json

{
  "name": "Gandalf",
  "weightLimit": 100
}

# Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Gandalf",
    "weightLimit": 100,
    "currentWeight": 0,
    "questState": "resting",
    "items": [],
    "missionsCompleted": 0,
    "createdAt": "2026-02-27T10:00:00.000Z",
    "updatedAt": "2026-02-27T10:00:00.000Z"
  }
}
```

#### Load Items onto Mover

```
POST /api/magic-movers/507f1f77bcf86cd799439011/load
Content-Type: application/json

{
  "itemIds": ["507f191e810c19729de860ea", "507f191e810c19729de860eb"]
}

# Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Gandalf",
    "questState": "loading",
    "currentWeight": 45,
    "items": [...]
  },
  "message": "Items loaded successfully"
}
```

## 🗄 Database Schema

### MagicMover Collection

```typescript
{
  _id: ObjectId,
  name: string,                    // Mover name (required, trimmed)
  weightLimit: number,             // Max capacity (min: 1)
  currentWeight: number,           // Current load (default: 0)
  questState: string,              // 'resting' | 'loading' | 'on-mission'
  items: ObjectId[],               // References to MagicItem documents
  missionsCompleted: number,       // Counter (default: 0)
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-updated
}
```

**Indexes:**

*   `questState` for filtering
*   `missionsCompleted` for leaderboard

### MagicItem Collection

```typescript
{
  _id: ObjectId,
  name: string,                    // Item name (required, trimmed)
  weight: number,                  // Item weight (min: 0.01)
  assignedTo: ObjectId | null,     // Reference to MagicMover (null = available)
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-updated
}
```

**Indexes:**

*   `assignedTo` for availability queries

### ActivityLog Collection

```typescript
{
  _id: ObjectId,
  moverId: ObjectId,               // Reference to MagicMover (required)
  action: string,                  // 'resting' | 'loading' | 'on-mission'
  items: ObjectId[],               // Snapshot of items at time of action
  createdAt: Date,                 // Auto-generated (timestamp)
  updatedAt: Date                  // Auto-updated
}
```

**Indexes:**

*   `moverId` for per-mover queries
*   `createdAt` for time-based sorting

## 🏗 Architecture

### Layered Architecture with Dependency Injection

```
┌─────────────────────────────────────────┐
│            Routes Layer                 │
│  (Endpoints + Validation Chains)        │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Controllers Layer               │
│  (HTTP Request/Response Handling)       │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Services Layer                 │
│  (Business Logic + Orchestration)       │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│        Repositories Layer               │
│  (Data Access + Mongoose Operations)    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         MongoDB Database                │
└─────────────────────────────────────────┘
```

All layers are wired via **tsyringe** dependency injection container for:

*   Loose coupling
*   Easy testability
*   Swappable implementations

### Quest State Machine

```
     ┌─────────┐
     │ resting │ ◄────────────────┐
     └────┬────┘                  │
          │ (load items)          │
          │                       │
     ┌────▼────┐                  │
     │ loading │                  │
     └────┬────┘                  │
          │ (can load more)       │
          ↓                       │
     ┌────────┐                   │
     │ loading│                   │
     └────┬───┘                   │
          │ (start mission)       │
          │                       │
     ┌────▼────────┐              │
     │ on-mission  │              │
     └─────┬───────┘              │
           │ (end mission)        │
           │ • Unload items       │
           │ • Increment counter  │
           └──────────────────────┘
```

### Key Patterns

#### 1\. Atomic Database Operations

Prevents race conditions using MongoDB atomic operators:

```typescript
// Atomic weight validation during loading
MagicMover.findOneAndUpdate(
  {
    _id: id,
    $expr: { $lte: [{ $add: ["$currentWeight", totalWeight] }, "$weightLimit"] }
  },
  {
    $addToSet: { items: { $each: itemIds } },
    $inc: { currentWeight: totalWeight }
  }
)

// Atomic item assignment to prevent double-booking
MagicItem.updateMany(
  { _id: { $in: itemIds }, assignedTo: null },
  { $set: { assignedTo: moverId } }
)
```

#### 2\. Custom Error Hierarchy

```typescript
AppError (abstract)
├── NotFoundError (404)
├── BadRequestError (400)
├── ValidationError (400 with details)
├── ConflictError (409)
├── UnprocessableEntityError (422)
└── InternalServerError (500)
```

**Operational vs Non-Operational Errors:**

*   **Operational**: Expected business errors (safe to expose to client)
*   **Non-Operational**: Programming errors (generic message to client)

#### 3\. Standardized Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [ ... ]  // Optional validation details
}
```

#### 4\. Input Validation Pattern

```typescript
// Routes use validation chains
router.post(
  '/',
  [...createMoverValidators, validate],
  controller.create
)

// Validators are composable and reusable
export const createMoverValidators = [
  body('name').isString().trim().notEmpty(),
  body('weightLimit').isNumeric().custom(...)
]
```

## 🧪 Testing

### Run Tests

```
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

### Test Infrastructure

*   **mongodb-memory-server**: In-memory MongoDB (no external DB needed)
*   **Jest**: Test runner with TypeScript support
*   **Supertest**: HTTP integration testing
*   **Isolated Tests**: Each test gets a fresh database

### Test Coverage

Tests include:

*   ✅ Magic Movers CRUD operations
*   ✅ Magic Items CRUD operations
*   ✅ Mission lifecycle (load → start → end)
*   ✅ State machine validation
*   ✅ Weight limit enforcement
*   ✅ Atomic operations (race condition prevention)
*   ✅ Activity log generation
*   ✅ Query filtering and pagination
*   ✅ Error handling scenarios
*   ✅ End-to-end workflows

## ⚠️ Error Handling

### Global Error Handler

All errors pass through centralized error handling middleware:

**Operational Errors** - Expected business logic errors

*   Safe to expose message to client
*   Includes: validation errors, not found, conflicts, etc.

**Non-Operational Errors** - Programming errors

*   Generic message to client ("Internal server error")
*   Full details logged server-side

### Common Error Responses

```typescript
// Validation Error (400)
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "weightLimit", "message": "Must be at least 1" }
  ]
}

// Not Found (404)
{
  "success": false,
  "message": "Magic Mover not found",
  "code": "NOT_FOUND"
}

// Conflict (409)
{
  "success": false,
  "message": "One or more items are already assigned to another mover",
  "code": "CONFLICT"
}

// Bad Request (400)
{
  "success": false,
  "message": "Cannot load items while mover is on a mission",
  "code": "BAD_REQUEST"
}
```

## 🐳 Docker Deployment

### Docker Compose Services

```
services:
  app:
    - Node.js 20 Alpine
    - Health checks (HTTP /health endpoint)
    - Resource limits: 1 CPU, 512MB RAM
    - Automatic restart on failure

  mongodb:
    - MongoDB 7
    - Health checks (mongosh ping)
    - Resource limits: 1 CPU, 1GB RAM
    - Persistent volumes for data
    - Network isolation
```

### Production Best Practices

✅ **Multi-stage builds** - Smaller image size  
✅ **Non-root user** - Security (nodejs:nodejs)  
✅ **dumb-init** - Proper signal handling  
✅ **Health checks** - Container orchestration ready  
✅ **Resource limits** - Prevent resource exhaustion  
✅ **Persistent volumes** - Data survives container restarts  
✅ **Environment isolation** - No external dependencies in container

### Health Monitoring

```
# Check container health
docker-compose ps

# View health check logs
docker inspect magic-transporter-app-1 | grep -A 10 Health

# Test health endpoint
curl http://localhost:3000/health
```

## 📝 Usage Workflow Example

### Complete Mission Flow

```
# 1. Create a Magic Mover
POST /api/magic-movers
{ "name": "Gandalf", "weightLimit": 100 }
# → Returns mover with ID

# 2. Create Magic Items
POST /api/magic-items
{ "name": "Elder Wand", "weight": 15 }
POST /api/magic-items
{ "name": "Ring of Power", "weight": 30 }
# → Returns items with IDs

# 3. Load items onto mover
POST /api/magic-movers/{moverId}/load
{ "itemIds": ["item1-id", "item2-id"] }
# → Mover state: resting → loading
# → Activity log created

# 4. Start mission
PUT /api/magic-movers/{moverId}/start-mission
# → Mover state: loading → on-mission
# → Activity log created

# 5. End mission
PUT /api/magic-movers/{moverId}/end-mission
# → Mover state: on-mission → resting
# → Items unloaded (assignedTo set to null)
# → missionsCompleted incremented
# → Activity log created

# 6. Check leaderboard
GET /api/magic-movers/top-movers
# → Returns movers sorted by missions completed

# 7. View activity history
GET /api/activity-logs/mover/{moverId}
# → Returns all state transitions for this mover
```