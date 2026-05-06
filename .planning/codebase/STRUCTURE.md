# STRUCTURE

## Repository Layout
```
DeliveryManager/
├── backend/                  # NestJS Application
│   ├── src/
│   │   ├── auth/             # Authentication logic
│   │   ├── users/            # Resident user management
│   │   ├── condominiums/     # Hierarchy definitions
│   │   ├── packages/         # Package receiving and tracking
│   │   ├── main.ts           # App entry point
│   │   └── seed.ts           # Initial admin seed script
│   ├── docker-compose.yml    # Database configuration
│   └── package.json
├── frontend/                 # Next.js Application
│   ├── src/
│   │   ├── app/              # Next.js App Router definitions
│   │   ├── components/       # Shared UI components
│   │   ├── features/         # Domain-driven feature modules (e.g., packages)
│   │   ├── lib/              # Utils and configurations
│   │   ├── providers/        # React context providers
│   │   ├── services/         # API integration layers
│   │   └── middleware.ts     # Next.js route protection middleware
│   └── package.json
├── .planning/                # GSD (Get Shit Done) planning artifacts
├── README.md
```

## Key Locations
- **Backend API Routes**: Defined in the controllers within each domain folder in `backend/src/`.
- **Frontend Pages**: Located in `frontend/src/app/`, utilizing folders for route names.
- **Frontend Server Actions**: Often co-located near their feature domains, e.g., `frontend/src/features/packages/actions.ts`.

## Naming Conventions
- **Backend**: Standard NestJS conventions (`*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.entity.ts`, `*.dto.ts`). Classes are PascalCase, files are kebab-case.
- **Frontend**: Standard React/Next.js conventions. Components are PascalCase, files are kebab-case (`confirm-pickup-form.tsx`). Features are grouped by domain.
