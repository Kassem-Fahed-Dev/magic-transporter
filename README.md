# Magic Transporters API

A REST API for managing Magic Movers and their missions. Magic Movers carry Magic Items on quests, powered by virtual magic.

## Tech Stack

*   **Runtime**: Node.js with TypeScript
*   **Framework**: Express.js
*   **Database**: MongoDB with Mongoose ODM
*   **DI Container**: tsyringe
*   **Validation**: express-validator
*   **Documentation**: Swagger (OpenAPI 3.0)
*   **Testing**: Jest + Supertest with mongodb-memory-server
*   **Containerization**: Docker & Docker Compose

## Project Structure

```
src/
├── config/          # App configuration, DB connection, DI container, Swagger
├── controllers/     # HTTP request handlers
├── middleware/       # Error handling and validation middleware
├── models/          # Mongoose schemas and interfaces
├── repositories/    # Data access layer
├── routes/          # Express route definitions with Swagger annotations
├── services/        # Business logic layer
├── types/           # Shared TypeScript types and enums
├── app.ts           # Express app setup
└── server.ts        # Entry point
tests/
├── setup.ts              # Test DB setup (mongodb-memory-server)
├── magic-items.test.ts   # Magic Items e2e tests
└── magic-movers.test.ts  # Magic Movers e2e tests
```

## Getting Started

### Prerequisites

*   Node.js >= 18
*   MongoDB (local or Docker)

### Installation

```
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and adjust values as needed:

```
cp .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Server port |
| `MONGODB_URI` | `mongodb://localhost:27017/magic-transporters` | MongoDB connection |
| `NODE_ENV` | `development` | Environment |

### Running Locally

```
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Running with Docker

```
docker-compose up --build
```

This starts both the API and a MongoDB instance.

## API Documentation

Once the server is running, visit:

**http://localhost:3000/api-docs**

Interactive Swagger UI with all endpoints documented.

## API Endpoints

### Magic Items

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/magic-items` | Create a Magic Item |
| GET | `/api/magic-items` | List all Magic Items |

### Magic Movers

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/magic-movers` | Create a Magic Mover |
| GET | `/api/magic-movers` | List all Magic Movers |
| POST | `/api/magic-movers/:id/load` | Load items onto a mover |
| PUT | `/api/magic-movers/:id/start-mission` | Start a mission |
| PUT | `/api/magic-movers/:id/end-mission` | End a mission (unloads items) |
| GET | `/api/magic-movers/top-movers` | List movers by missions completed (desc) |

## Testing

```
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

Tests use an in-memory MongoDB instance via `mongodb-memory-server` — no external database required.

## Architecture

The project follows a **layered architecture** with dependency injection:

1.  **Routes** — Define endpoints and validation rules
2.  **Controllers** — Handle HTTP request/response
3.  **Services** — Business logic and validation
4.  **Repositories** — Data access (Mongoose operations)

All layers are wired via **tsyringe** DI container for loose coupling and testability.

## Quest State Machine

```
resting → loading → on-mission → resting
            ↑                       │
            └───────────────────────┘
```

*   **resting**: Mover is idle. Can start loading items.
*   **loading**: Items are being loaded. Can load more items or start a mission.
*   **on-mission**: Mover is delivering items. Cannot load more items.
*   Ending a mission unloads all items and increments the missions completed counter.