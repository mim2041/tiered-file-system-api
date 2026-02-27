# Tiered File System API

Express + TypeScript + Prisma + PostgreSQL boilerplate for a SaaS File Management System, structured similarly to [`express-typescript-prisma-postgresql`](https://github.com/sushantrahate/express-typescript-prisma-postgresql).

## Current Scope (Milestone: Boilerplate Only)

- Project structure ready for feature modules (auth, subscriptions, folders/files) without implementing them yet.
- Environment config with Zod validation (`src/config/env-config.ts`, `src/config/env-schema.ts`).
- Prisma + PostgreSQL wiring (`prisma/schema.prisma`, `src/config/prisma.config.ts`).
- Express app and server bootstrap (`src/app.ts`, `src/server.ts`) with:
  - Helmet, CORS, rate limiting
  - JSON body parsing
  - `/` and `/health` endpoints
  - Central error and 404 middleware.

## Quick Start

1. Copy env file:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Initialize Prisma:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Run dev server:

   ```bash
   npm run dev
   ```

API base URL: `http://localhost:5000`

