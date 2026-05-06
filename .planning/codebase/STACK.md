# STACK

## Overview
This repository contains a full-stack application for managing deliveries in condominiums. It is split into a frontend and a backend workspace.

## Runtime & Languages
- **Node.js**: >= 18
- **TypeScript**: Used strictly across both frontend and backend (`strict: true`).

## Backend Stack
- **Framework**: NestJS 11
- **Database**: PostgreSQL 15 (Dockerized)
- **ORM**: TypeORM
- **Authentication**: JWT via Passport
- **Validation**: `class-validator`, `class-transformer`
- **Security**: Helmet, bcrypt, rate limiting (`@nestjs/throttler`), CORS.
- **Documentation**: Swagger (OpenAPI)

## Frontend Stack
- **Framework**: Next.js 16.2.3 (App Router)
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS v4, `tw-animate-css`
- **Components**: shadcn/ui, base-ui, lucide-react
- **Data Fetching / State**: `@tanstack/react-query`, `axios`
- **Validation**: `zod`
