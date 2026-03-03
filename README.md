# Tiered File System API

Express + TypeScript + Prisma + PostgreSQL boilerplate for a SaaS File Management System, structured similarly to [`express-typescript-prisma-postgresql`](https://github.com/sushantrahate/express-typescript-prisma-postgresql).

## Current Scope

- Auth + role-based access control for public and admin APIs.
- Subscription package management (public list + admin CRUD).
- User subscription activation and history APIs.
- Folder and file APIs with quota checks by active subscription package.
- Admin management APIs for:
   - users list
   - subscription enrollment history list
   - dashboard home stats
   - audit log list

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

## Admin APIs

All admin routes require `Bearer` access token and `ADMIN` role.

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/subscriptions/enrollments`
- `GET /api/v1/admin/dashboard/stats`
- `GET /api/v1/admin/audit-logs`

Audit logs now capture package create/update/delete events.

