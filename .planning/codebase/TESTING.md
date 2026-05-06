# TESTING

## Backend
- **Framework**: Jest (standard with NestJS).
- **Structure**: Tests are co-located with their respective files using the `*.spec.ts` naming convention for unit tests.
- **E2E Testing**: Located in the `test/` directory using Supertest (`*.e2e-spec.ts`).
- **Mocking**: Typical NestJS testing utilities are used to mock dependencies (`@nestjs/testing`).

## Frontend
- **Current State**: Frontend testing infrastructure is not explicitly heavily detailed in the base structure but is expected to align with Next.js standard testing practices (e.g., Jest + React Testing Library).
