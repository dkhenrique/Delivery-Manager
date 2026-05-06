# CONCERNS

## Technical Debt

- **Axios in Server Actions (F-09)**: The Next.js frontend currently utilizes an Axios instance (`api`) within its Server Actions. This is considered technical debt in modern Next.js applications (App Router). It should be refactored to use the native `fetch` API, which is properly integrated into the Next.js caching and revalidation system.
- **Sidebar Active State (F-10)**: The navigation sidebar (`dashboard/layout.tsx`) currently lacks a visual indication of the active route. This requires extracting the navigation link items into a Client Component that leverages the `usePathname` hook to style the active route appropriately.

## Fragile Areas
- **Form Component Isolation**: Previously, there was an issue where Server Components and Client Components were mixed within the same file (e.g., `confirmar/page.tsx`), leading to build and runtime errors. Care must be taken to ensure strict boundaries; stateful logic (`useState`, `useActionState`, etc.) must be isolated in explicit Client Components (`'use client'`).

## Performance & Security
- Next.js Server Actions must remain secure. While validation is handled via Zod on the frontend, we must ensure the backend handles authorization comprehensively to prevent IDOR (Insecure Direct Object Reference) or unauthorized package access/modification.
