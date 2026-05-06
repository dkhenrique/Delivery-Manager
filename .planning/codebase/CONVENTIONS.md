# CONVENTIONS

## General
- **Language**: TypeScript with `strict: true` across the entire monorepo.
- **Linting & Formatting**: ESLint and Prettier are standard.

## Backend (NestJS)
- **Dependency Injection**: Utilize constructor injection heavily as per NestJS paradigms.
- **Validation**: Use `class-validator` decorators on Data Transfer Objects (DTOs). Ensure `whitelist: true` and `forbidNonWhitelisted: true` in global validation pipes to prevent mass-assignment vulnerabilities.
- **Error Handling**: Use NestJS built-in HTTP exceptions (e.g., `NotFoundException`, `BadRequestException`). Let global exception filters format the output.
- **Security**: Apply `@Roles()` decorator and `RolesGuard` for RBAC. Exclude sensitive data (like passwords) from responses using `class-transformer`'s `@Exclude()`.

## Frontend (Next.js & React 19)
- **Server Components by Default**: In Next.js App Router, components are React Server Components (RSC) unless marked with `'use client'`.
- **Client Components boundary**: Extract stateful UI logic (e.g., forms using `useState`, `useActionState`, `useFormStatus`, or `onClick`) into separate Client Components to keep pages as Server Components.
- **Form Actions**: Prefer Server Actions (`"use server"`) combined with React 19's `useActionState` over traditional controlled forms and manual `fetch` calls.
- **Styling**: Tailwind CSS v4 in a "CSS-first" configuration (utilizing `@theme` in the main CSS file, avoiding legacy `tailwind.config.js` setups).
- **Accessibility**: UI components should follow WCAG AA standards (semantic HTML, proper `aria-` labels, visible focus states).
