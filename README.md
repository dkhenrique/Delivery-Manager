# 📦 Delivery Manager — Gerenciador de Entregas para Condomínios

Sistema web para digitalizar o fluxo de recebimento e retirada de encomendas em condomínios residenciais sem portaria presencial.

> Moradores registram encomendas recebidas, o sistema gera um código de retirada e notifica o destinatário por e-mail. A retirada é confirmada via código — garantindo rastreabilidade de ponta a ponta.

---

## 🎯 Problema

Condomínios sem portaria dependem de grupos de WhatsApp, quadros físicos ou planilhas para controlar encomendas — sem rastreabilidade, sem confirmação de retirada e sem histórico.

## 💡 Solução

Aplicação web com:

- **Registro de encomendas** com código de confirmação de 6 dígitos
- **Notificação por e-mail** ao destinatário quando a encomenda chega
- **Confirmação de retirada** via código — prova digital de entrega
- **Painel administrativo** para o síndico aprovar cadastros e monitorar encomendas

---

## 🏗️ Tech Stack

| Camada       | Tecnologia                                                  |
| ------------ | ----------------------------------------------------------- |
| **Backend**  | NestJS 11, TypeScript (strict)                              |
| **Banco**    | PostgreSQL 15 (Docker)                                      |
| **Auth**     | JWT (Passport) com RBAC (`ADMIN` / `RESIDENT`)              |
| **ORM**      | TypeORM                                                     |
| **Validação**| class-validator + class-transformer                         |
| **Segurança**| Helmet, CORS, bcrypt, rate limiting (throttler)             |
| **Docs API** | Swagger (OpenAPI) em `/api/docs`                            |

---

## 📁 Estrutura do Projeto

```
DeliveryManager/
├── backend/
│   ├── src/
│   │   ├── auth/              # Autenticação JWT, guards, strategies
│   │   ├── users/             # CRUD de moradores, aprovação/rejeição
│   │   ├── condominiums/      # Condomínios, blocos e apartamentos
│   │   ├── main.ts            # Bootstrap com helmet, CORS, prefix
│   │   └── seed.ts            # Script de seed (admin inicial)
│   ├── docker-compose.yml     # PostgreSQL 15
│   ├── .env.example           # Template de variáveis de ambiente
│   └── package.json
└── README.md
```

---

## 🚀 Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) e Docker Compose

### 1. Clone o repositório

```bash
git clone https://github.com/dkhenrique/Delivery-Manager.git
cd Delivery-Manager/backend
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e defina um `JWT_SECRET` seguro:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=devuser
DB_PASSWORD=devpassword
DB_NAME=delivery_manager
JWT_SECRET=sua_chave_secreta_aqui
```

> ⚠️ A aplicação **não inicia** sem o `JWT_SECRET` configurado.

### 3. Suba o banco de dados

```bash
docker compose up -d
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Rode o seed (cria o admin inicial)

```bash
npm run seed
```

Credenciais do admin:
| Campo | Valor |
|-------|-------|
| Email | `admin@condominium.com` |
| Senha | `admin` |

### 6. Inicie o servidor

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000/api/v1`  
Documentação Swagger em `http://localhost:3000/api/docs`

---

## 🔑 Endpoints Principais

### Auth

| Método | Rota              | Descrição                | Auth |
| ------ | ----------------- | ------------------------ | ---- |
| POST   | `/auth/login`     | Login (retorna JWT)      | ❌   |
| POST   | `/auth/register`  | Auto-cadastro de morador | ❌   |

### Users (Admin only)

| Método | Rota                 | Descrição                          |
| ------ | -------------------- | ---------------------------------- |
| GET    | `/users`             | Listar todos os moradores          |
| GET    | `/users/pending`     | Listar cadastros pendentes         |
| GET    | `/users/:id`         | Buscar morador por ID              |
| PATCH  | `/users/:id`         | Atualizar dados do morador         |
| PATCH  | `/users/:id/approve` | Aprovar cadastro                   |
| PATCH  | `/users/:id/reject`  | Rejeitar cadastro (com motivo)     |
| DELETE | `/users/:id`         | Remover morador                    |

### Condominiums / Blocks / Apartments

| Método | Rota              | Descrição                    | Auth  |
| ------ | ----------------- | ---------------------------- | ----- |
| POST   | `/condominiums`   | Criar condomínio             | Admin |
| GET    | `/condominiums`   | Listar condomínios           | JWT   |
| POST   | `/blocks`         | Criar bloco                  | Admin |
| GET    | `/blocks`         | Listar blocos                | JWT   |
| POST   | `/apartments`     | Criar apartamento            | Admin |
| GET    | `/apartments`     | Listar apartamentos          | JWT   |

### Packages (Encomendas)

| Método | Rota                          | Descrição                                 | Auth  |
| ------ | ----------------------------- | ----------------------------------------- | ----- |
| POST   | `/packages`                   | Registrar uma encomenda recebida          | JWT   |
| GET    | `/packages`                   | Listar todas as encomendas                | Admin |
| GET    | `/packages/my`                | Listar encomendas do meu apartamento      | JWT   |
| GET    | `/packages/guarded`           | Listar encomendas que estou guardando     | JWT   |
| GET    | `/packages/:id`               | Detalhes da encomenda                     | JWT   |
| PATCH  | `/packages/:id/confirm`       | Confirmar retirada via código 6 dígitos   | JWT   |
| POST   | `/packages/:id/resend-code`   | Reenviar código de retirada               | JWT   |
| POST   | `/packages/:id/photo`         | Enviar foto da encomenda                  | JWT   |

### Dashboard

| Método | Rota                 | Descrição                          | Auth  |
| ------ | -------------------- | ---------------------------------- | ----- |
| GET    | `/dashboard/metrics` | Obter métricas do dashboard        | Admin |

> Todas as rotas acima são prefixadas com `/api/v1`.

---

## 🔒 Segurança

- **JWT obrigatório** — sem fallback hardcoded; app falha ao iniciar se não configurado
- **Password hash** — bcrypt com salt rounds 10, excluído de todas as respostas via `@Exclude()`
- **RBAC** — `@Roles(ADMIN)` em rotas administrativas com `RolesGuard`
- **Validação** — `class-validator` com `whitelist` e `forbidNonWhitelisted` (anti mass assignment)
- **Headers** — Helmet ativado (X-Frame-Options, CSP, HSTS, etc.)
- **CORS** — habilitado para desenvolvimento

---

## 📋 Roadmap

### ✅ Implementado

- [x] Autenticação JWT com login e auto-cadastro
- [x] CRUD completo de usuários com aprovação/rejeição
- [x] Hierarquia de condomínios → blocos → apartamentos
- [x] RBAC com roles `ADMIN` e `RESIDENT`
- [x] Validação de DTOs e proteção contra mass assignment
- [x] Swagger/OpenAPI docs
- [x] Docker Compose para PostgreSQL
- [x] **Módulo de Encomendas** — registro, listagem, status (PENDING → PICKED_UP → EXPIRED)
- [x] **Código de Retirada** — geração de 6 dígitos com expiração de 24h
- [x] **Notificações por e-mail** — envio ao destinatário na chegada e na aprovação/rejeição
- [x] **Prazo de guarda** — alerta ao morador e síndico após período de inatividade via cron job
- [x] **Dashboard do Síndico** — métricas e indicadores de encomendas e moradores pendentes

---

## 🧪 Scripts Disponíveis

```bash
npm run start:dev    # Dev com hot-reload
npm run build        # Build de produção
npm run start:prod   # Rodar build em produção
npm run seed         # Criar admin inicial no banco
npm run lint         # Lint com ESLint
npm run test         # Testes unitários
npm run test:e2e     # Testes end-to-end
```

---

## 📄 Licença

Projeto privado — uso restrito.
