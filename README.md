# Duties Backend

An Express + TypeScript + PostgreSQL REST API for managing “duties” with clean layering (Router → Controller → Service → Repository), schema validation via Zod, and first-class Jest tests (unit + integration). Deployed on Vercel.

**Live API**
[https://duty-back-qea2fsvrb-druiz0508-8273s-projects.vercel.app/](https://duty-back-qea2fsvrb-druiz0508-8273s-projects.vercel.app/)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Environment](#environment)
- [Local Development](#local-development)
- [Scripts](#scripts)
- [API](#api)
- [Validation & Error Handling](#validation--error-handling)
- [Database](#database)
- [Testing Strategy](#testing-strategy)
- [Logging](#logging)
- [Deployment (Vercel)](#deployment-vercel)
- [CI, Quality & Conventions](#ci-quality--conventions)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Tech Stack

*   **Runtime**: Node.js (TypeScript, Express 4)
*   **Database**: PostgreSQL (`pg`)
*   **Validation**: Zod
*   **Testing**: Jest, Supertest
*   **Linting**: ESLint
*   **Hosting**: Vercel (Node runtime)

---

## Project Structure

```
.
├─ index.ts                     # Local bootstrap for tests; Express app listens only in NODE_ENV=test
├─ jest.config.ts               # Jest setup (ts-jest, node env)
├─ tsconfig.json                # TS compiler options
├─ package.json
├─ src/
│  ├─ app.ts                    # App composition; exports the Express app (default)
│  ├─ controllers/
│  │  ├─ default.controller.ts  # Base controller with error wrapper
│  │  ├─ duty.controller.ts     # Duties controller (CRUD handlers)
│  │  └─ index.ts
│  ├─ middlewares/
│  │  ├─ logging.middleware.ts  # Request logging (duration, status)
│  │  ├─ validation.middleware.ts# Zod body validation
│  │  └─ index.ts
│  ├─ repository/
│  │  ├─ db.ts                  # DB Pool (connection string, SSL, pooling)
│  │  ├─ duty.repository.ts     # Postgres repository for duties
│  │  └─ index.ts
│  ├─ routes/
│  │  ├─ default.router.ts      # Base router contract
│  │  ├─ duty.router.ts         # /duties routes
│  │  └─ index.ts
│  ├─ schemas/
│  │  ├─ duty.schema.ts         # Zod schemas for Duty + DTOs + params
│  │  └─ index.ts
│  ├─ services/
│  │  ├─ duty.service.ts        # Business logic layer
│  │  ├─ logging.service.ts     # Logger abstraction
│  │  └─ index.ts
│  └─ utils/
│     ├─ env.ts                 # Environment loading (dotenv)
│     ├─ types.ts               # Shared types + exceptions
│     └─ index.ts
└─ tests/
   ├─ setup-env.ts              # Test env bootstrap
   ├─ global.d.ts
   ├─ setup/globalSetup.ts      # Jest global setup (migrations, etc.)
   ├─ helpers/db.ts             # Test DB helper (migrate, truncate, close)
   ├─ unit/duty.service.test.ts # Unit tests
   └─ integration/duties.int.test.ts # Integration (Supertest against Express app)
```

---

## Architecture

Layered design (each layer has one responsibility, simple to test & swap):

*   **Router** (`src/routes`) – maps HTTP routes to controller methods and attaches middleware (e.g., validation).
*   **Controller** (`src/controllers`) – parses/validates request data, handles errors via a base `apply` wrapper, and calls services.
*   **Service** (`src/services`) – business logic and orchestration; talks only to repositories.
*   **Repository** (`src/repository`) – data access (PostgreSQL via `pg`), returns typed domain objects. Handles pagination, not-found, etc.
*   **Schemas** (`src/schemas`) – Zod schemas for DTOs, params, and domain types.
*   **Middlewares** (`src/middlewares`) – request logging, body validation, CORS.
*   **Utils** (`src/utils`) – environment, shared types, exceptions.

Express app composition happens in `src/app.ts`:
1.  Creates DB pool/migrates.
2.  Instantiates middleware, repository, service, controller.
3.  Wires routes and returns the Express `app` instance (exported as `default`).

> This export is crucial for Vercel—Vercel mounts the app; we don’t call `listen()` in production.

---

## Environment

Create a `.env` file at the project root:

```env
# PostgreSQL connection string
DATABASE_URL=postgres://<user>:<pass>@<host>:<port>/<db>

# Set true when using managed Postgres with TLS on Vercel/Cloud providers
PGSSL=true

# Only used for local/testing (Vercel injects its own server)
PORT=8080

# Local modes: development | test | production
NODE_ENV=development
```

`src/utils/env.ts` loads these variables (via `dotenv/config`).

---

## Local Development

The app’s Express instance is exported from `src/app.ts`. For local runs, you can use a small dev entry point. In this repo, `index.ts` starts the server only when `NODE_ENV === "test"` (used by integration tests).

For manual local runs, create a simple `dev.ts` bootstrap:

```typescript
import app from "./src/app";
import { env } from "./src/utils";

const port = env.port || 3000;
app.listen(port, () => {
  console.log(`Local API on http://localhost:${port}`);
});
```

Then add a script to `package.json`:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only dev.ts"
}
```

Install dependencies and run:
```bash
pnpm install        # or npm i / yarn
pnpm dev            # starts local server
```

---

## Scripts

From `package.json`:

*   `pnpm build` – Compiles TypeScript to the `dist/` directory.
*   `pnpm start` – Runs the compiled server.
*   `pnpm dev` – (Suggested) Uses `ts-node-dev` for hot reloading.
*   `pnpm test` / `pnpm test:watch` – Runs Jest tests.
*   `pnpm lint` – Runs ESLint.

---

## API

**Base URL (Production):**
`https://duty-back-qea2fsvrb-druiz0508-8273s-projects.vercel.app/`

### Health

*   `GET /health` → **200** ` { "ok": true }`

### Duties

**Entity Schema:**
```typescript
Duty {
  id: string (uuid)
  name: string (1..255)
}
```

**List (paginated)**
*   `GET /duties?page=<number>&pageSize=<number>`
*   **Response (200 OK):**
    ```json
    {
      "items": Duty[],
      "total": number,
      "page": number,
      "pageSize": number,
      "totalPages": number
    }
    ```
> Notes: `page` ≥ 1, 1 ≤ `pageSize` ≤ 100.

**Get by ID**
*   `GET /duties/:id`
*   **Response (200 OK):** `Duty`
*   **Response (404 Not Found):** `{ "error": "Not found" }`

**Create**
*   `POST /duties`
*   **Request Body:**
    ```json
    { "name": "New duty" }
    ```
*   **Response (201 Created):** `Duty`
*   **Response (400 Bad Request):** `{ "message": "Bad request.", "details": [...] }` (from Zod)

**Update**
*   `PUT /duties/:id`
*   **Request Body:**
    ```json
    { "name": "Updated duty" }
    ```
*   **Response (200 OK):** `Duty`
*   **Response (404 Not Found):** `{ "error": "Not found" }`
*   **Response (400 Bad Request):** Zod error as above.

**Delete**
*   `DELETE /duties/:id`
*   **Response (204 No Content):** (no body)
*   **Response (404 Not Found):** `{ "error": "Not found" }`

### CORS

CORS is enabled centrally in `src/app.ts`.

---

## Validation & Error Handling

*   **Validation**: Zod schemas in `src/schemas`, enforced via `ValidationMiddleware` per route.
    *   Body validation for `create`/`update`.
    *   Param validation (UUID) as part of controllers.
*   **Error Contract**:
    *   **Zod errors** → `400` `{ "message": "Bad request.", "details": [...] }`
    *   **Not found** → `404` `{ "error": "Not found" }`
    *   **Unhandled errors** → `500` `{ "error": "Internal server error" }`

`DefaultController.apply()` uniformly wraps handlers and prevents duplicate `res.send()`.

---

## Database

*   **PostgreSQL** via `pg` using a pooled connection (`src/repository/db.ts`).
*   **Connection String**: `DATABASE_URL`.
*   **SSL**: Set `PGSSL=true` (Vercel/managed PG requires TLS).
*   **Migrations**: `Database.migrate()` is invoked during app initialization.
*   **Repository**: `PgDutyRepository` implements `list`, `get`, `create`, `update`, and `delete`.
*   **Data Model**: A `duties` table with `id uuid` and `name text/varchar(255)`.

---

## Testing Strategy

*   **Unit tests** (`tests/unit`): Tests service logic in isolation (e.g., `duty.service.test.ts`).
*   **Integration tests** (`tests/integration`): Spins up the real Express app and hits endpoints using Supertest (e.g., `duties.int.test.ts`).

The tests use a `TestDb` helper which:
1.  `migrate()` before all tests.
2.  `truncate()` between tests.
3.  `close()` after all tests.

**Jest Config** (`jest.config.ts`):
*   `ts-jest` preset, Node environment.
*   `setupFiles`: `tests/setup-env.ts` for env bootstrap.
*   `testTimeout`: 30s.

**Running Tests:**
```bash
pnpm test            # Run all tests
pnpm test:watch      # Run in watch mode
```

> For integration tests, ensure your local `DATABASE_URL` points to a test database. These tests will migrate and truncate data.

---

## Logging

*   **Middleware (`LoggingMiddleware`)**: logs `{ method, url, statusCode, durationMs }` after the response finishes.
*   **Service (`LoggingService`)**: Provides a consistent place to output service-level logs (currently console-based).

---

## Deployment (Vercel)

The app is deployed at: [https://duty-back-qea2fsvrb-druiz0508-8273s-projects.vercel.app/](https://duty-back-qea2fsvrb-druiz0508-8273s-projects.vercel.app/)

Key points for Express on Vercel:
*   **Export the Express app** instance as the `default` export; do not call `app.listen()` in production.
*   Create a Vercel function entry point under `api/index.ts`:
    ```typescript
    // api/index.ts
    export { default } from "../src/app";
    ```
*   (Optional) Route all traffic to your API function with a rewrite in `vercel.json`:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }],
      "functions": {
        "api/**/*.ts": { "runtime": "nodejs18.x" }
      }
    }
    ```
*   **Environment variables** (Vercel Dashboard → Settings):
    *   `DATABASE_URL` – your Postgres connection string.
    *   `PGSSL` – `true` (if your provider requires SSL).
    *   `NODE_ENV` – `production`.

---