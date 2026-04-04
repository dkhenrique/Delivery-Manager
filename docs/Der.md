# DER — Gerenciador de Entregas para Condomínios

## Diagrama Entidade-Relacionamento (Notação Textual)

```
Condominium (1) ──── (N) Block
Block        (1) ──── (N) Apartment
Apartment    (1) ──── (N) User (moradores do apto)
User         (1) ──── (N) Package (encomendas registradas por ele)
Apartment    (1) ──── (N) Package (encomendas destinadas ao apto)
Package      (1) ──── (1) PickupCode
Package      (1) ──── (N) Notification
User         (1) ──── (N) Notification
```

---

## Entidades e Atributos

### Condominium

Representa o condomínio. Estrutura preparada para multi-tenant (V2).

| Coluna     | Tipo         | Restrições              | Descrição           |
| ---------- | ------------ | ----------------------- | ------------------- |
| id         | UUID         | PK, NOT NULL            | Identificador único |
| name       | VARCHAR(150) | NOT NULL                | Nome do condomínio  |
| address    | VARCHAR(255) | NOT NULL                | Endereço completo   |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Data de criação     |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Data de atualização |

---

### Block

Bloco do condomínio. Sempre existe ao menos um (o bloco padrão "Principal").

| Coluna         | Tipo        | Restrições                 | Descrição                   |
| -------------- | ----------- | -------------------------- | --------------------------- |
| id             | UUID        | PK, NOT NULL               | Identificador único         |
| condominium_id | UUID        | FK → Condominium, NOT NULL | Condomínio ao qual pertence |
| name           | VARCHAR(50) | NOT NULL                   | Nome ou letra do bloco      |
| created_at     | TIMESTAMP   | NOT NULL, DEFAULT NOW()    | Data de criação             |
| updated_at     | TIMESTAMP   | NOT NULL, DEFAULT NOW()    | Data de atualização         |

**Constraint:** UNIQUE (condominium_id, name)

---

### Apartment

Unidade habitacional dentro de um bloco.

| Coluna     | Tipo        | Restrições              | Descrição                       |
| ---------- | ----------- | ----------------------- | ------------------------------- |
| id         | UUID        | PK, NOT NULL            | Identificador único             |
| block_id   | UUID        | FK → Block, NOT NULL    | Bloco ao qual pertence          |
| number     | VARCHAR(20) | NOT NULL                | Número ou identificador do apto |
| floor      | INTEGER     | NULLABLE                | Andar (opcional)                |
| created_at | TIMESTAMP   | NOT NULL, DEFAULT NOW() | Data de criação                 |
| updated_at | TIMESTAMP   | NOT NULL, DEFAULT NOW() | Data de atualização             |

**Constraint:** UNIQUE (block_id, number)

---

### User

Morador ou administrador do sistema.

| Coluna                | Tipo                                    | Restrições                   | Descrição                                                    |
| --------------------- | --------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| id                    | UUID                                    | PK, NOT NULL                 | Identificador único                                          |
| apartment_id          | UUID                                    | FK → Apartment, NULLABLE     | Apartamento do morador (null para admin sem apto)            |
| name                  | VARCHAR(150)                            | NOT NULL                     | Nome completo                                                |
| email                 | VARCHAR(255)                            | NOT NULL, UNIQUE             | E-mail de login e notificações                               |
| password_hash         | VARCHAR(255)                            | NOT NULL                     | Senha com hash bcrypt                                        |
| cpf                   | VARCHAR(14)                             | NOT NULL, UNIQUE             | CPF (único no sistema)                                       |
| role                  | ENUM('ADMIN', 'RESIDENT')               | NOT NULL, DEFAULT 'RESIDENT' | Papel no sistema                                             |
| status                | ENUM('PENDING', 'APPROVED', 'REJECTED') | NOT NULL, DEFAULT 'PENDING'  | Status de aprovação                                          |
| rejection_reason      | TEXT                                    | NULLABLE                     | Justificativa de rejeição (obrigatória se status = REJECTED) |
| pending_alert_sent_at | TIMESTAMP                               | NULLABLE                     | Última vez que o alerta de pendência foi enviado             |
| created_at            | TIMESTAMP                               | NOT NULL, DEFAULT NOW()      | Data de criação                                              |
| updated_at            | TIMESTAMP                               | NOT NULL, DEFAULT NOW()      | Data de atualização                                          |

---

### Package

Encomenda registrada por um morador em favor de outro.

| Coluna                 | Tipo                                           | Restrições                         | Descrição                                         |
| ---------------------- | ---------------------------------------------- | ---------------------------------- | ------------------------------------------------- |
| id                     | UUID                                           | PK, NOT NULL                       | Identificador único                               |
| received_by_user_id    | UUID                                           | FK → User, NOT NULL                | Morador que recebeu e está guardando              |
| recipient_apartment_id | UUID                                           | FK → Apartment, NOT NULL           | Apartamento do dono da encomenda                  |
| description            | VARCHAR(500)                                   | NULLABLE                           | Descrição opcional da encomenda                   |
| photo_url              | VARCHAR(500)                                   | NULLABLE                           | URL da foto da encomenda                          |
| status                 | ENUM('WAITING_PICKUP', 'DELIVERED', 'OVERDUE') | NOT NULL, DEFAULT 'WAITING_PICKUP' | Status atual                                      |
| storage_deadline       | DATE                                           | NOT NULL                           | Prazo máximo de guarda definido pelo morador      |
| overdue_alert_sent_at  | TIMESTAMP                                      | NULLABLE                           | Data em que o alerta de prazo vencido foi enviado |
| delivered_at           | TIMESTAMP                                      | NULLABLE                           | Data e hora da retirada                           |
| created_at             | TIMESTAMP                                      | NOT NULL, DEFAULT NOW()            | Data de registro                                  |
| updated_at             | TIMESTAMP                                      | NOT NULL, DEFAULT NOW()            | Data de atualização                               |

---

### PickupCode

Código de retirada vinculado a uma encomenda. Relação 1:1 com Package.

| Coluna     | Tipo       | Restrições                     | Descrição                    |
| ---------- | ---------- | ------------------------------ | ---------------------------- |
| id         | UUID       | PK, NOT NULL                   | Identificador único          |
| package_id | UUID       | FK → Package, NOT NULL, UNIQUE | Encomenda vinculada          |
| code       | VARCHAR(6) | NOT NULL                       | Código numérico de 6 dígitos |
| expires_at | TIMESTAMP  | NOT NULL                       | Expiração (geração + 24h)    |
| created_at | TIMESTAMP  | NOT NULL, DEFAULT NOW()        | Data de geração do código    |

**Nota:** Quando um novo código é gerado (reenvio após expiração), o registro anterior é substituído (UPDATE), não duplicado.

---

### Notification

Log de notificações enviadas pelo sistema.

| Coluna     | Tipo                                                                                                                                                                  | Restrições                | Descrição                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------ |
| id         | UUID                                                                                                                                                                  | PK, NOT NULL              | Identificador único                                    |
| user_id    | UUID                                                                                                                                                                  | FK → User, NOT NULL       | Destinatário da notificação                            |
| package_id | UUID                                                                                                                                                                  | FK → Package, NULLABLE    | Encomenda relacionada (se aplicável)                   |
| type       | ENUM('PACKAGE_RECEIVED', 'CODE_RESENT', 'PACKAGE_DELIVERED', 'REGISTRATION_APPROVED', 'REGISTRATION_REJECTED', 'PENDING_REGISTRATION_ALERT', 'OVERDUE_PACKAGE_ALERT') | NOT NULL                  | Tipo de notificação                                    |
| channel    | ENUM('EMAIL')                                                                                                                                                         | NOT NULL, DEFAULT 'EMAIL' | Canal de envio (preparado para push/whatsapp na V2)    |
| sent_at    | TIMESTAMP                                                                                                                                                             | NOT NULL, DEFAULT NOW()   | Data e hora do envio                                   |
| metadata   | JSONB                                                                                                                                                                 | NULLABLE                  | Dados adicionais do envio (ex: message_id do provedor) |

---

## SQL — CREATE TABLE (PostgreSQL + TypeORM compatible)

```sql
-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('ADMIN', 'RESIDENT');
CREATE TYPE user_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE package_status AS ENUM ('WAITING_PICKUP', 'DELIVERED', 'OVERDUE');
CREATE TYPE notification_type AS ENUM (
  'PACKAGE_RECEIVED',
  'CODE_RESENT',
  'PACKAGE_DELIVERED',
  'REGISTRATION_APPROVED',
  'REGISTRATION_REJECTED',
  'PENDING_REGISTRATION_ALERT',
  'OVERDUE_PACKAGE_ALERT'
);
CREATE TYPE notification_channel AS ENUM ('EMAIL');

-- CONDOMINIUM
CREATE TABLE condominiums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- BLOCK
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE RESTRICT,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_block_name_per_condominium UNIQUE (condominium_id, name)
);

-- APARTMENT
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE RESTRICT,
  number VARCHAR(20) NOT NULL,
  floor INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_apartment_number_per_block UNIQUE (block_id, number)
);

-- USER
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'RESIDENT',
  status user_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  pending_alert_sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PACKAGE
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  received_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  recipient_apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE RESTRICT,
  description VARCHAR(500),
  photo_url VARCHAR(500),
  status package_status NOT NULL DEFAULT 'WAITING_PICKUP',
  storage_deadline DATE NOT NULL,
  overdue_alert_sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- PICKUP CODE
CREATE TABLE pickup_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL UNIQUE REFERENCES packages(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- NOTIFICATION
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'EMAIL',
  sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- ÍNDICES
CREATE INDEX idx_packages_recipient_apartment ON packages(recipient_apartment_id);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_storage_deadline ON packages(storage_deadline);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_apartment ON users(apartment_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_pickup_codes_code ON pickup_codes(code);
```

---

## Notas para Implementação com TypeORM

- Usar `@Entity()` decorators no NestJS para cada tabela
- Usar `@Column({ type: 'enum', enum: UserRole })` para os enums
- Configurar `@BeforeUpdate()` hook para atualizar `updated_at` automaticamente
- Usar `@OneToOne`, `@OneToMany` e `@ManyToOne` para os relacionamentos
- A entidade `PickupCode` usa `@OneToOne(() => Package)` com `@JoinColumn()`
- Habilitar `synchronize: false` em produção — usar migrations
- Criar migrations com `typeorm migration:generate` para controle de versão do schema
