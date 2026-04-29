# DeliveryManager Frontend — UI Skill & Pattern Guide

> **Propósito:** Este documento descreve todos os padrões, convenções e regras do frontend. Todo novo componente, página ou feature **deve** seguir estas diretrizes para manter consistência total com o código existente.

---

## Índice

1. [Stack & Dependências](#1-stack--dependências)
2. [Estrutura de Diretórios](#2-estrutura-de-diretórios)
3. [Convenções de Nomenclatura](#3-convenções-de-nomenclatura)
4. [Componentes Server vs Client](#4-componentes-server-vs-client)
5. [Shell de Páginas de Auth](#5-shell-de-páginas-de-auth)
6. [Padrão de Formulário de Auth](#6-padrão-de-formulário-de-auth)
7. [Padrão de Server Action](#7-padrão-de-server-action)
8. [Padrão de Schemas Zod](#8-padrão-de-schemas-zod)
9. [Busca de Dados em Server Components](#9-busca-de-dados-em-server-components)
10. [Padrão de Inline Server Action em Páginas](#10-padrão-de-inline-server-action-em-páginas)
11. [Layout do Dashboard](#11-layout-do-dashboard)
12. [Mini-Componentes Reutilizáveis](#12-mini-componentes-reutilizáveis)
13. [Padrões Tailwind](#13-padrões-tailwind)
14. [Landing Page](#14-landing-page)
15. [Middleware](#15-middleware)
16. [API Integration](#16-api-integration)
17. [Tipos TypeScript](#17-tipos-typescript)
18. [Ícones lucide-react](#18-ícones-lucide-react)
19. [Anti-Padrões](#19-anti-padrões)

---

## 1. Stack & Dependências

| Pacote                     | Versão  | Papel                                          |
| -------------------------- | ------- | ---------------------------------------------- |
| `next`                     | 16.2.3  | Framework (App Router)                         |
| `react`                    | 19.2.4  | UI runtime                                     |
| `@base-ui/react`           | ^1.4.0  | Camada primitiva do shadcn                     |
| `@tanstack/react-query`    | ^5.99.0 | Client data fetching (provider disponível)     |
| `axios`                    | ^1.15.0 | Chamadas em Server Actions                     |
| `zod`                      | ^4.3.6  | Validação de schemas                           |
| `class-variance-authority` | ^0.7.1  | Variantes de Button                            |
| `clsx` + `tailwind-merge`  | latest  | Utilitário `cn()`                              |
| `lucide-react`             | ^1.8.0  | Ícones                                         |
| `tailwindcss`              | ^4      | Estilização (v4 — usa `@import "tailwindcss"`) |
| `shadcn`                   | ^4.2.0  | CLI de codegen de componentes                  |

**Alias de importação:** `@/*` → `src/*`

```ts
// Correto
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { serverFetch } from "@/lib/server-api";
import { loginAction } from "@/features/auth/actions";
```

---

## 2. Estrutura de Diretórios

```
src/
├── app/                          # Next.js App Router (rotas em português)
│   ├── page.tsx                  # Landing page (pública)
│   ├── layout.tsx                # Root layout com ReactQueryProvider
│   ├── globals.css               # CSS global com @import "tailwindcss"
│   ├── login/page.tsx            # Formulário de login
│   ├── cadastro/page.tsx         # Formulário de cadastro
│   ├── esqueci-senha/page.tsx    # Formulário de recuperação
│   ├── redefinir-senha/page.tsx  # Formulário de redefinição (lê ?token=)
│   └── dashboard/
│       ├── layout.tsx            # Layout com sidebar + autenticação
│       ├── page.tsx              # Painel com métricas
│       ├── packages/page.tsx     # Lista de encomendas
│       └── residents/page.tsx    # Gestão de moradores
├── features/
│   └── <feature>/                # Pasta por domínio
│       ├── actions.ts            # Server Actions ("use server" no topo)
│       ├── schemas.ts            # Schemas Zod + tipos exportados
│       └── components/           # Componentes Client da feature
├── components/
│   ├── ui/                       # Primitivos shadcn (button, card, input, label)
│   └── landing/                  # Componentes exclusivos da landing page
├── lib/
│   ├── utils.ts                  # cn() e utilidades gerais
│   ├── auth.ts                   # getAuthUser(), getAuthToken() (Server)
│   └── server-api.ts             # serverFetch<T>() (Server Components)
├── providers/
│   └── react-query-provider.tsx  # QueryClientProvider ("use client")
├── services/
│   └── api.ts                    # Instância axios (Client/Server Actions)
└── middleware.ts                 # Proteção de rotas (raiz de src/)
```

**Regras:**

- Novos domínios → pasta em `src/features/<nome-kebab>/`
- Componentes de landing page → `src/components/landing/`
- Páginas do dashboard → `src/app/dashboard/<rota>/page.tsx`
- Rotas em **português e kebab-case**: `esqueci-senha`, `redefinir-senha`, `meus-pacotes`

---

## 3. Convenções de Nomenclatura

| Item                              | Convenção                     | Exemplo                          |
| --------------------------------- | ----------------------------- | -------------------------------- |
| Arquivos de componente            | kebab-case                    | `login-form.tsx`                 |
| Arquivos de página                | sempre `page.tsx`             | `app/cadastro/page.tsx`          |
| Funções exportadas                | PascalCase                    | `export function LoginForm()`    |
| Funções privadas (dentro de page) | PascalCase                    | `function Hero()`                |
| Server Actions                    | camelCase com sufixo `Action` | `loginAction`, `approveResident` |
| Schemas Zod                       | camelCase com sufixo `Schema` | `loginSchema`, `registerSchema`  |
| Tipos de estado de actions        | PascalCase com sufixo `State` | `LoginState`, `RegisterState`    |
| Arrays de dados (landing)         | SCREAMING_SNAKE_CASE          | `FEATURES`, `STEPS`, `PLANS`     |
| Mapas de status                   | SCREAMING_SNAKE_CASE          | `STATUS_LABELS`, `STATUS_STYLES` |
| Constantes de navegação           | SCREAMING_SNAKE_CASE          | `NAV_LINKS`, `navItems`          |

---

## 4. Componentes Server vs Client

**Regra:** Tudo é Server Component por padrão. Adicione `"use client"` **somente** quando necessário.

| Trigger                                      | Diretiva         |
| -------------------------------------------- | ---------------- |
| `useActionState`, `useFormStatus`            | `"use client"`   |
| `useTransition`, `useState`, `useEffect`     | `"use client"`   |
| Event handlers (`onClick`, `onSubmit`)       | `"use client"`   |
| `await serverFetch()`, `await getAuthUser()` | Server Component |
| Composição estática de layout                | Server Component |

```tsx
// ✅ Server Component — busca dados diretamente
export default async function PackagesPage() {
  const user = await getAuthUser();
  const packages = await serverFetch<PackageItem[]>("/packages");
  return <PackageList packages={packages} />;
}

// ✅ Client Component — usa hooks de formulário
("use client");
export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, { success: false });
  // ...
}
```

---

## 5. Shell de Páginas de Auth

Todas as páginas públicas de autenticação (`/login`, `/cadastro`, `/esqueci-senha`, `/redefinir-senha`) usam **exatamente** este shell:

```tsx
export default function NomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-muted/30">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Cabeçalho */}
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Delivery Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Subtítulo descritivo da página.
          </p>
        </div>

        {/* Form component */}
        <NomeForm />

        {/* Links auxiliares (opcional) */}
        <div className="flex flex-col items-center gap-2 text-sm">
          <Link
            href="/cadastro"
            className="text-primary hover:underline font-medium"
          >
            Não tem conta? Cadastre-se
          </Link>
          <Link
            href="/esqueci-senha"
            className="text-muted-foreground hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        {/* Rodapé copyright */}
        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Desenvolvido via Arquitetura Limpa
        </div>
      </div>
    </main>
  );
}
```

---

## 6. Padrão de Formulário de Auth

Todo formulário de autenticação **deve** seguir esta estrutura exata:

### 6.1 Imports obrigatórios

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { NomeAction, type NomeState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// NÃO importe CardFooter — ele cria um divider indesejado
```

### 6.2 SubmitButton inner component

Sempre defina **antes** da função principal. Aceita `disabled?` quando o form pode ser travado após sucesso:

```tsx
function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending || disabled}>
      {pending ? "Processando..." : "Texto do botão"}
    </Button>
  );
}
```

### 6.3 Estado inicial tipado

```tsx
const initialState: NomeState = { success: false };
```

### 6.4 useActionState binding

```tsx
const [state, formAction] = useActionState(nomeAction, initialState);
```

### 6.5 Estrutura do Card

```tsx
<Card className="w-full max-w-sm mx-auto shadow-sm">
  <CardHeader>
    <CardTitle className="text-2xl font-bold">Título do Card</CardTitle>
    <CardDescription>Descrição curta da ação.</CardDescription>
  </CardHeader>

  {/* <form> envolve CardContent — não envolve <Card> inteiro */}
  <form action={formAction}>
    <CardContent className="space-y-4 pb-6">
      {/* Campo individual */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="exemplo@email.com"
          required
          aria-describedby={state?.errors?.email ? "email-error" : undefined}
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-sm text-destructive font-medium">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      {/* Mensagem de erro global (abaixo de todos os campos) */}
      {!state?.success && state?.message && (
        <p className="text-sm text-destructive text-center font-medium">
          {state.message}
        </p>
      )}

      {/* Mensagem de sucesso */}
      {state?.success && state?.message && (
        <p className="text-sm text-green-600 text-center font-medium">
          {state.message}
        </p>
      )}

      {/* Botão: sempre dentro de div.pt-2, sempre a última coisa em CardContent */}
      <div className="pt-2">
        <SubmitButton disabled={state?.success} />
      </div>
    </CardContent>
  </form>
</Card>
```

### 6.6 Link de navegação (abaixo do Card, fora dele)

```tsx
<p className="text-center text-sm text-muted-foreground">
  Já tem conta?{" "}
  <Link href="/login" className="text-primary hover:underline font-medium">
    Entrar
  </Link>
</p>
```

### 6.7 Estado de sucesso com painel (para forgot-password)

Quando o sucesso substitui o formulário por um painel:

```tsx
if (state.success) {
  return (
    <Card className="w-full max-w-sm mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Título de sucesso</CardTitle>
        <CardDescription>Descrição do que aconteceu.</CardDescription>
      </CardHeader>
      <CardContent className="pb-6 space-y-4 text-center">
        <p className="text-sm text-green-600 font-medium">{state.message}</p>
        <Link
          href="/login"
          className="inline-block text-sm text-primary hover:underline font-medium"
        >
          Voltar ao login
        </Link>
      </CardContent>
    </Card>
  );
}
```

---

## 7. Padrão de Server Action

### 7.1 Estrutura do arquivo

```ts
"use server"; // Primeira linha — SEMPRE

import { redirect } from "next/navigation";
import { nomeSchema } from "./schemas";
import api from "@/services/api";
```

### 7.2 Tipo de estado (exportado)

```ts
export type NomeState = {
  success: boolean;
  errors?: Record<string, string[]>; // erros por campo (Zod fieldErrors)
  message?: string; // mensagem global de erro ou sucesso
};
```

### 7.3 Assinatura da função

```ts
export async function nomeAction(
  prevState: NomeState,
  formData: FormData,
): Promise<NomeState> {
```

### 7.4 Fluxo completo

```ts
export async function exemploAction(
  prevState: ExemploState,
  formData: FormData,
): Promise<ExemploState> {
  // 1. Extrair campos do FormData
  const campo = formData.get("campo") as string;

  // 2. Validar com Zod
  const validated = exemploSchema.safeParse({ campo });
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Verifique os campos e tente novamente.",
    };
  }

  // 3. Chamada à API dentro de try/catch
  try {
    const response = await api.post("/endpoint", validated.data);

    // 3a. Setar cookie httpOnly (quando necessário)
    const { cookies } = await import("next/headers");
    (await cookies()).set("jwt", response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dia
    });
  } catch (error: unknown) {
    // Tipagem segura do erro Axios
    const axiosError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: axiosError.response?.data?.message ?? "Mensagem de erro padrão.",
    };
  }

  // 4. redirect() SEMPRE fora do try/catch
  // Isso é crítico: redirect() lança NEXT_REDIRECT que seria engolido pelo catch.
  redirect("/destino");
}
```

### 7.5 Action sem redirect (retorna sucesso)

```ts
export async function semRedirectAction(
  prevState: SemRedirectState,
  formData: FormData,
): Promise<SemRedirectState> {
  // ... validação e try/catch ...
  try {
    await api.post("/endpoint", payload);
    return {
      success: true,
      message: "Operação realizada com sucesso!",
    };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: axiosError.response?.data?.message ?? "Erro ao processar.",
    };
  }
  // Sem redirect aqui
}
```

### 7.6 Ação de logout

```ts
export async function logoutAction(): Promise<void> {
  const { cookies } = await import("next/headers");
  (await cookies()).delete("jwt");
  redirect("/login");
}
```

---

## 8. Padrão de Schemas Zod

### 8.1 Regras

- Schemas ficam em `features/<feature>/schemas.ts`
- Todo schema exporta o schema E o tipo inferido no mesmo arquivo
- Mensagens de erro são sempre inline com `{ message: "..." }`
- Sem arquivos externos de mensagens

### 8.2 Schema simples

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Digite um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

### 8.3 Schema com `.refine()` (validação cruzada)

```ts
export const registerSchema = z
  .object({
    password: z.string().min(6, { message: "Mínimo 6 caracteres." }),
    confirmPassword: z.string().min(1, { message: "Confirme a senha." }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"], // campo que recebe o erro
  });
```

### 8.4 Schema com `.transform()` (sanitização)

```ts
cpf: z
  .string()
  .min(11, { message: "CPF deve ter 11 dígitos." })
  .max(14, { message: "CPF inválido." })
  .transform((v) => v.replace(/\D/g, "")), // remove formatação
```

### 8.5 Extração de payload sem campo de confirmação

```ts
// Correto: construir payload explicitamente, sem confirmPassword
const payload = {
  name: validated.data.name,
  email: validated.data.email,
  password: validated.data.password,
};
// Nunca: const { confirmPassword: _, ...payload } = validated.data;
// (causa warnings de unused vars)
```

---

## 9. Busca de Dados em Server Components

### 9.1 Helper `serverFetch<T>`

```ts
// src/lib/server-api.ts — use para todos os GET em Server Components
import { serverFetch } from "@/lib/server-api";

// Uso:
const packages = await serverFetch<PackageItem[]>("/packages");
const metrics = await serverFetch<DashboardMetrics>("/dashboard/metrics");
```

### 9.2 Padrão completo de página com dados

```tsx
async function DataComponent() {
  let data: ItemType[] = [];
  let error: string | null = null;

  try {
    data = await serverFetch<ItemType[]>("/endpoint");
  } catch (err: unknown) {
    error = (err as Error)?.message ?? "Erro ao carregar dados.";
  }

  // Estado de erro
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os dados: {error}
      </div>
    );
  }

  // Estado vazio
  if (data.length === 0) {
    return <EmptyState />;
  }

  // Estado com dados
  return <DataTable data={data} />;
}
```

### 9.3 Obter usuário autenticado

```tsx
import { getAuthUser } from "@/lib/auth";

export default async function Page() {
  const user = await getAuthUser();
  const isAdmin = user?.role === "ADMIN";
  // ...
}
```

---

## 10. Padrão de Inline Server Action em Páginas

Para mutations simples (aprovar, rejeitar, deletar) em páginas Server Component, defina as actions diretamente no arquivo da página com `"use server"` como **primeira instrução da função** (não do arquivo):

```tsx
// Dentro de um page.tsx (não tem "use server" no topo do arquivo)
import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function approveItem(formData: FormData) {
  "use server"; // diretiva de função — não de arquivo

  const itemId = formData.get("itemId") as string;
  if (!itemId) return;

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  const token = await getAuthToken();

  await fetch(`${BASE_URL}/items/${itemId}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  revalidatePath("/dashboard/items"); // revalida a página após a mutação
}

// Componente de formulário associado
function ApproveForm({ itemId }: { itemId: string }) {
  return (
    <form action={approveItem}>
      <input type="hidden" name="itemId" value={itemId} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
      >
        Aprovar
      </button>
    </form>
  );
}
```

**Quando usar inline vs. `actions.ts`:**

- **Inline:** mutations simples e específicas de uma página (aprovar, rejeitar, deletar)
- **`actions.ts`:** forms reutilizáveis, auth, operações com redirect

---

## 11. Layout do Dashboard

### 11.1 Estrutura do navItems

```tsx
const navItems = [
  {
    href: "/dashboard",
    label: "Painel",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    href: "/dashboard/packages",
    label: "Encomendas",
    icon: Package,
    adminOnly: false,
  },
  {
    href: "/dashboard/residents",
    label: "Moradores",
    icon: Users,
    adminOnly: true,
  },
  // Adicione novas rotas aqui seguindo o mesmo shape
];
```

### 11.2 Shell do layout autenticado

```tsx
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  const isAdmin = user?.role === "ADMIN";
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="hidden md:flex flex-col w-64 bg-background border-r">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">...</div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* User + logout — sempre no rodapé da sidebar */}
        <div className="border-t px-3 py-4 space-y-2">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? "—"}
            </p>
            <p className="text-xs font-medium">
              {user?.role === "ADMIN" ? "Administrador" : "Morador"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-background border-b">
          ...
          <LogoutButton />
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
```

### 11.3 Cabeçalho de página do dashboard

Toda página dentro do dashboard começa com:

```tsx
<div className="flex flex-col gap-8">
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-bold tracking-tight">Título da Página</h1>
    <p className="text-sm text-muted-foreground">
      Descrição breve do conteúdo da página.
    </p>
  </div>
  {/* conteúdo */}
</div>
```

---

## 12. Mini-Componentes Reutilizáveis

Estes componentes são **criados inline** dentro do arquivo da página que os usa. Não são extraídos para arquivos separados, a menos que sejam compartilhados entre 3+ páginas.

### 12.1 StatusBadge

```tsx
// Sempre acompanhado de três mapas: LABELS, STYLES, ICONS
type MeuStatus = "ATIVO" | "INATIVO" | "PENDENTE";

const STATUS_LABELS: Record<MeuStatus, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  PENDENTE: "Pendente",
};

const STATUS_STYLES: Record<MeuStatus, string> = {
  ATIVO: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  INATIVO: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  PENDENTE:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const STATUS_ICONS: Record<MeuStatus, React.ReactNode> = {
  ATIVO: <CheckCircle2 className="h-3.5 w-3.5" />,
  INATIVO: <XCircle className="h-3.5 w-3.5" />,
  PENDENTE: <Clock className="h-3.5 w-3.5" />,
};

function StatusBadge({ status }: { status: MeuStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
```

### 12.2 EmptyState

```tsx
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-16 text-center">
      <IconeRelevante className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">
        Nenhum item encontrado
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Os itens registrados aparecerão aqui.
      </p>
    </div>
  );
}
```

### 12.3 Tabela padrão

```tsx
<div className="rounded-xl border bg-background shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Coluna
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr
            key={item.id}
            className="border-b last:border-0 hover:bg-muted/30 transition-colors"
          >
            <td className="px-4 py-3 text-sm font-medium text-foreground">
              {item.valor}
            </td>
            <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
              {item.codigo}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {/* Rodapé com contagem */}
  <div className="px-4 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
    {items.length} item{items.length !== 1 ? "s" : ""} encontrado
    {items.length !== 1 ? "s" : ""}
  </div>
</div>
```

### 12.4 MetricCard

```tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  highlight,
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl border bg-background p-6 shadow-sm flex flex-col gap-4 ${
        highlight ? "border-primary/40 bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}
```

### 12.5 LogoutButton

```tsx
"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "../actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Saindo..." : "Sair"}
    </Button>
  );
}
```

---

## 13. Padrões Tailwind

### 13.1 Classes de superfície

| Superfície        | Classes                                                     |
| ----------------- | ----------------------------------------------------------- |
| Card padrão       | `rounded-xl border bg-background shadow-sm`                 |
| Card com padding  | `rounded-xl border bg-background p-6 shadow-sm`             |
| Card destacado    | `+ border-primary/40 bg-primary/5`                          |
| Tabela container  | `rounded-xl border bg-background shadow-sm overflow-hidden` |
| Seção (landing)   | `py-24 px-4 sm:px-6 bg-white` ou `bg-slate-50`              |
| Container landing | `max-w-6xl mx-auto`                                         |

### 13.2 Estado de erro de dados

```tsx
<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
  Não foi possível carregar: {error}
</div>
```

### 13.3 Alerta de status (ex: conta pendente)

```tsx
<div className="flex items-center gap-2 rounded-lg border border-yellow-400/40 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
  <Clock className="h-4 w-4 shrink-0" />
  <span>
    Sua conta está <strong>pendente de aprovação</strong>.
  </span>
</div>
```

### 13.4 Paleta de cores dos badges

Sempre usar estas combinações **exatas** para garantir consistência visual:

```
Sucesso/Aprovado/Retirado:    bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300
Atenção/Pendente/Aguardando:  bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300
Erro/Rejeitado/Perdido:       bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300
Info/Guardado/Neutro:         bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300
```

### 13.5 Botão de ação inline (sem shadcn Button)

Para botões dentro de tabelas e formulários de ação direta:

```tsx
// Aprovar (verde)
className =
  "inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors";

// Rejeitar (vermelho)
className =
  "inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors";
```

---

## 14. Landing Page

### 14.1 Estrutura geral

A landing page em `app/page.tsx` é um Server Component puro. Todos os sub-componentes são funções privadas no mesmo arquivo, exceto `ContactForm` (que requer `"use client"` e fica em `src/components/landing/`).

```tsx
// app/page.tsx
import { ContactForm } from "@/components/landing/contact-form";

function Topbar() { ... }
function Hero() { ... }
function Stats() { ... }
function Features() { ... }
function HowItWorks() { ... }
function Plans() { ... }
function Contact() { return <section>...<ContactForm />...</section>; }
function Footer() { ... }

export default function LandingPage() {
  return (
    <div className="scroll-smooth">
      <Topbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Plans />
      <Contact />
      <Footer />
    </div>
  );
}
```

### 14.2 Topbar

```tsx
<header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    {/* Logo: ícone + texto com cor na segunda palavra */}
    {/* Nav: hidden em mobile, links de hash anchor no centro */}
    {/* CTA: botão ghost "Login" + botão primário "Contrate agora" */}
  </div>
</header>
```

### 14.3 Section com cabeçalho padrão

```tsx
<section id="slug" className="py-24 px-4 sm:px-6 bg-white {ou bg-slate-50}">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
        Eyebrow / categoria
      </p>
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
        Título da seção
      </h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Subtítulo explicativo com contexto adicional.
      </p>
    </div>
    {/* Corpo da seção */}
  </div>
</section>
```

**Alternância de background:** seções ímpares `bg-white`, seções pares `bg-slate-50`.

### 14.4 Feature card (data-driven)

```tsx
const FEATURES = [
  {
    icon: Package,
    title: "Nome do recurso",
    description: "Descrição curta e objetiva do benefício.",
    colorClass: "bg-blue-100 text-blue-600", // unique per card
  },
];

// Render:
{
  FEATURES.map((feature) => {
    const Icon = feature.icon;
    return (
      <div className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.colorClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2 text-base">
          {feature.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {feature.description}
        </p>
      </div>
    );
  });
}
```

### 14.5 Pricing card (data-driven)

```tsx
const PLANS = [
  {
    name: "Básico",
    price: "R$ 99",
    period: "/mês",
    description: "Descrição do plano.",
    highlight: false, // plano destacado fica em bg-blue-600 e scale-105
    badge: undefined, // "Mais popular" no plano destacado
    features: ["Feature 1", "Feature 2"],
    cta: "Começar grátis",
    href: "/cadastro",
  },
];
```

Plano destacado recebe: `bg-blue-600 shadow-2xl shadow-blue-600/30 scale-105`
Badge: `absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full`

### 14.6 Stats bar

```tsx
<section className="py-14 bg-slate-900">
  <div className="max-w-6xl mx-auto px-4 sm:px-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((item) => (
        <div key={item.label}>
          <p className="text-3xl font-bold text-white">{item.value}</p>
          <p className="text-sm text-slate-400 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## 15. Middleware

```ts
// src/middleware.ts — raiz de src/
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt")?.value; // cookie: sempre "jwt"
  const { pathname } = request.nextUrl;

  // 1. Proteger rotas do dashboard
  if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Impedir acesso à tela de login se já autenticado
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    // adicione novas rotas protegidas ou públicas aqui
  ],
};
```

**Ao adicionar uma nova rota protegida:** inclua no `matcher` e adicione lógica de redirect se necessário.

**Nota de segurança:** o middleware verifica apenas a **existência** do cookie `jwt`. A verificação da assinatura é feita pelo backend em cada request autenticada.

---

## 16. API Integration

### 16.1 Dois clientes, dois contextos

| Cliente            | Arquivo                 | Contexto                          |
| ------------------ | ----------------------- | --------------------------------- |
| `axios` instance   | `src/services/api.ts`   | Server Actions, `"use server"`    |
| `serverFetch<T>()` | `src/lib/server-api.ts` | Server Components (`async` pages) |
| `fetch` direto     | inline em page.tsx      | Inline Server Actions (mutations) |

### 16.2 Padrão do header de autorização

```ts
// Sempre use este spread condicional exato
...(token ? { Authorization: `Bearer ${token}` } : {})
```

### 16.3 serverFetch — para GET em Server Components

```ts
// Automaticamente lê o cookie "jwt" e adiciona Authorization header
import { serverFetch } from "@/lib/server-api";

const data = await serverFetch<TipoDeRetorno>("/endpoint");
```

### 16.4 api (axios) — para POST/PATCH em Server Actions

```ts
import api from "@/services/api";

const response = await api.post("/auth/login", { email, password });
const response = await api.post("/auth/register", payload);
```

### 16.5 fetch direto — para mutations em inline Server Actions

```ts
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const token = await getAuthToken();

await fetch(`${BASE_URL}/users/${userId}/approve`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
  cache: "no-store",
});
```

---

## 17. Tipos TypeScript

### 17.1 Tipos de role e status (sempre union literals)

```ts
type UserRole = "ADMIN" | "RESIDENT";
type UserStatus = "PENDING" | "APPROVED" | "REJECTED";
type PackageStatus =
  | "WAITING_PICKUP"
  | "PICKED_UP"
  | "STORED_BY_NEIGHBOR"
  | "LOST";
```

### 17.2 AuthUser (payload do JWT)

```ts
export interface AuthUser {
  sub: string;
  email: string;
  role: "ADMIN" | "RESIDENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  iat: number;
  exp: number;
}
```

### 17.3 Captura de erros Axios (sem `any`)

```ts
// Correto: cast tipado
} catch (error: unknown) {
  const axiosError = error as { response?: { data?: { message?: string } } };
  const msg = axiosError.response?.data?.message ?? "Mensagem padrão.";
}

// Também correto: cast para Error
} catch (err: unknown) {
  error = (err as Error)?.message ?? "Erro desconhecido.";
}
```

### 17.4 Record maps para status

```ts
const STATUS_LABELS: Record<MeuStatus, string>    = { ... };
const STATUS_STYLES: Record<MeuStatus, string>    = { ... };
const STATUS_ICONS:  Record<MeuStatus, ReactNode> = { ... };
```

---

## 18. Ícones lucide-react

### 18.1 Tamanhos padrão por contexto

| Contexto               | Classes                              |
| ---------------------- | ------------------------------------ |
| Links da sidebar       | `h-4 w-4 shrink-0`                   |
| Ícones de seção/card   | `h-5 w-5`                            |
| Estado vazio           | `h-12 w-12 text-muted-foreground/40` |
| Badges de status       | `h-3.5 w-3.5`                        |
| Botões de ação inline  | `h-3.5 w-3.5`                        |
| Botão Logout           | `h-4 w-4`                            |
| Hero da landing (CTA)  | `h-4 w-4`                            |
| Welcome card dashboard | `h-8 w-8 text-primary`               |

### 18.2 Padrão data-driven

Quando ícones fazem parte de arrays de dados, armazene o construtor e instancie inline:

```tsx
const FEATURES = [{ icon: Package, ... }];

// Render:
const Icon = feature.icon;
<Icon className="h-5 w-5" />
```

---

## 19. Anti-Padrões

> ❌ = proibido | ✅ = correto

### Formulários

```tsx
// ❌ Não use CardFooter em formulários de auth — cria divisória indesejada
<CardFooter><SubmitButton /></CardFooter>

// ✅ SubmitButton dentro de CardContent com div.pt-2
<CardContent className="space-y-4 pb-6">
  {/* campos */}
  <div className="pt-2"><SubmitButton /></div>
</CardContent>
```

### Server Actions

```tsx
// ❌ redirect() dentro de try/catch — é engolido pela exceção
try {
  await api.post("...", data);
  redirect("/dashboard"); // ERRADO
} catch (e) { ... }

// ✅ redirect() APÓS o bloco try/catch
try { await api.post("...", data); } catch (e) { return error; }
redirect("/dashboard"); // CORRETO
```

### Tipos

```tsx
// ❌ Não use any em catch
} catch (error: any) { error.response.data.message }

// ✅ Use unknown com cast tipado
} catch (error: unknown) {
  const e = error as { response?: { data?: { message?: string } } };
}
```

### Componentes

```tsx
// ❌ Não adicione "use client" sem necessidade
"use client";
export function StaticCard() { return <div>...</div>; } // deveria ser Server Component

// ✅ "use client" apenas quando usa hooks interativos
"use client";
export function Form() {
  const [state, action] = useActionState(...); // justificado
}
```

### shadcn/ui

```tsx
// ❌ Não instale novos componentes shadcn sem conferir se já existe em ui/
// ✅ Verifique src/components/ui/ antes de instalar
```

### CSS

```tsx
// ❌ Não use bg-gradient-to-r (Tailwind v3 syntax)
className = "bg-gradient-to-r from-blue-600 to-indigo-600";

// ✅ Use bg-linear-to-r (Tailwind v4 syntax)
className = "bg-linear-to-r from-blue-600 to-indigo-600";
```

---

## Checklist para novos componentes/páginas

Antes de finalizar qualquer novo arquivo, valide:

- [ ] Arquivo com nome em **kebab-case**
- [ ] `"use client"` adicionado apenas se usa hooks/eventos
- [ ] Server Components usam `serverFetch<T>()` para GET
- [ ] Server Actions ficam em `features/<feature>/actions.ts` com `"use server"` no topo do arquivo
- [ ] Mutations simples na página usam Inline Server Actions com `"use server"` como primeira instrução da função + `revalidatePath()`
- [ ] `redirect()` chamado **fora** de blocos `try/catch`
- [ ] `catch (error: unknown)` com cast tipado — sem `any`
- [ ] Schemas Zod exportam schema **e** tipo inferido no mesmo arquivo
- [ ] Formulários de auth: sem `CardFooter`, botão em `div.pt-2` dentro de `CardContent className="space-y-4 pb-6"`
- [ ] Novos itens de nav no dashboard adicionados em `navItems` no `dashboard/layout.tsx`
- [ ] Novas rotas protegidas adicionadas ao `matcher` no `middleware.ts`
- [ ] Diagnóstico limpo (zero erros TypeScript/ESLint)
