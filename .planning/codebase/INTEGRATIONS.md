# INTEGRATIONS

## Database
- **PostgreSQL 15**: Primary relational database, managed locally via `docker-compose.yml`. Configured using TypeORM.

## Authentication
- **JWT (JSON Web Tokens)**: Local authentication implementation using `@nestjs/jwt` and `@nestjs/passport` on the backend.
- Role-based access control (RBAC) separates `ADMIN` and `RESIDENT` users.

## External Services
- **Nodemailer**: Used for sending notification emails to residents when a package arrives, and when a registration is approved or rejected.

## Planned / Potential Integrations
- Given the system requires notifications, there's potential for future integration with WhatsApp or SMS services for real-time delivery notifications.
