# ARCHITECTURE

## System Pattern
The project uses a monorepo-style structure separating the frontend and backend into isolated sub-projects, communicating via REST APIs.

## Backend Architecture (NestJS)
- **Pattern**: Modular architecture utilizing NestJS's standard Controller-Service-Module pattern.
- **Data Flow**: `Request -> Middleware/Guards (Auth, RBAC) -> Controller (Validation via DTOs) -> Service (Business Logic) -> Repository (TypeORM) -> Database`.
- **Entry Points**: `backend/src/main.ts` bootstraps the application, exposing `/api/v1` routes.
- **Key Modules**:
  - `Auth`: Handles JWT generation and validation.
  - `Users`: Manages resident approvals/rejections and CRUD.
  - `Condominiums`: Manages the hierarchy of Condominiums -> Blocks -> Apartments.
  - `Packages`: Handles receiving, querying, and confirming delivery packages via 6-digit confirmation codes.

## Frontend Architecture (Next.js)
- **Pattern**: Next.js App Router paradigm.
- **Data Flow**: Uses a mix of React Server Components (RSC) and Client Components. Forms utilize modern React 19 hooks (`useActionState`, `useFormStatus`). Data fetching uses Server Actions and Server Fetching, alongside `react-query` for client-side state where necessary.
- **Entry Points**: 
  - `frontend/src/app/layout.tsx` (Root layout)
  - `frontend/src/app/page.tsx` (Home/Login)
  - `frontend/src/app/dashboard/*` (Protected administrative and resident views)
- **Layers**:
  - `app/`: Routing and Server Components.
  - `features/`: Domain-specific components, actions, and logic (e.g., `packages`).
  - `components/`: Reusable UI components (shadcn/ui).
  - `lib/`: Utilities and shared logic.

## Security & Authentication Flow
- Clients authenticate via `/auth/login` and receive a JWT.
- JWT is attached to subsequent requests.
- Next.js frontend handles protected routes, likely via middleware or server-side checks before rendering pages.
