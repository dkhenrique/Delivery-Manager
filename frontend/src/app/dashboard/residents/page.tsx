import { serverFetch } from "@/lib/server-api";
import { getAuthUser, getAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Users, CheckCircle2, XCircle, Clock, UserCheck } from "lucide-react";

type UserRole = "ADMIN" | "RESIDENT";
type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Resident {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  status: UserStatus;
  rejection_reason: string | null;
  created_at: string;
  apartment?: {
    number: string;
    block: string | null;
  } | null;
}

const STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
};

const STATUS_STYLES: Record<UserStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  APPROVED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_ICONS: Record<UserStatus, React.ReactNode> = {
  PENDING: <Clock className="h-3.5 w-3.5" />,
  APPROVED: <CheckCircle2 className="h-3.5 w-3.5" />,
  REJECTED: <XCircle className="h-3.5 w-3.5" />,
};

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// ─── Server Actions ───────────────────────────────────────────────────────────

async function approveResident(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  if (!userId) return;

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

  revalidatePath("/dashboard/residents");
}

async function rejectResident(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const rejectionReason = formData.get("rejection_reason") as string;

  if (!userId || !rejectionReason?.trim()) return;

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  const token = await getAuthToken();

  await fetch(`${BASE_URL}/users/${userId}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ rejection_reason: rejectionReason.trim() }),
    cache: "no-store",
  });

  revalidatePath("/dashboard/residents");
}

// ─── Row Actions ──────────────────────────────────────────────────────────────

function ApproveForm({ userId }: { userId: string }) {
  return (
    <form action={approveResident}>
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors focus-visible:outline  focus-visible:outline-green-600"
      >
        <UserCheck className="h-3.5 w-3.5" />
        Aprovar
      </button>
    </form>
  );
}

function RejectForm({ userId }: { userId: string }) {
  return (
    <form action={rejectResident} className="flex items-start gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        type="text"
        name="rejection_reason"
        required
        minLength={3}
        placeholder="Motivo da rejeição…"
        className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50 w-44"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:outline focus-visible:outline-destructive shrink-0"
      >
        <XCircle className="h-3.5 w-3.5" />
        Rejeitar
      </button>
    </form>
  );
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

function SummaryStats({ residents }: { residents: Resident[] }) {
  const pending = residents.filter((r) => r.status === "PENDING").length;
  const approved = residents.filter((r) => r.status === "APPROVED").length;
  const rejected = residents.filter((r) => r.status === "REJECTED").length;

  const stats = [
    {
      label: "Pendentes",
      value: pending,
      style: "text-yellow-700 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    },
    {
      label: "Aprovados",
      value: approved,
      style: "text-green-700 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    },
    {
      label: "Rejeitados",
      value: rejected,
      style: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl border p-4 flex flex-col gap-1 ${stat.bg}`}
        >
          <p className={`text-2xl font-bold ${stat.style}`}>{stat.value}</p>
          <p className="text-xs text-muted-foreground font-medium">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Residents Table ──────────────────────────────────────────────────────────

function ResidentRow({ resident }: { resident: Resident }) {
  const apartment = resident.apartment
    ? `Apto ${resident.apartment.number}${resident.apartment.block ? ` — Bloco ${resident.apartment.block}` : ""}`
    : "—";

  const isPending = resident.status === "PENDING";

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors align-top">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            {resident.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {resident.email}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {formatCpf(resident.cpf)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{apartment}</td>
      <td className="px-4 py-3">
        <StatusBadge status={resident.status} />
        {resident.status === "REJECTED" && resident.rejection_reason && (
          <p className="mt-1 text-xs text-muted-foreground italic max-w-50">
            {resident.rejection_reason}
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(resident.created_at)}
      </td>
      <td className="px-4 py-3">
        {isPending ? (
          <div className="flex flex-col gap-2">
            <ApproveForm userId={resident.id} />
            <RejectForm userId={resident.id} />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-16 text-center">
      <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">
        Nenhum morador cadastrado
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Os moradores registrados aparecerão aqui.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResidentsPage() {
  const user = await getAuthUser();

  // Only admins can access this page
  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let residents: Resident[] = [];
  let error: string | null = null;

  try {
    residents = await serverFetch<Resident[]>("/users");
  } catch (err: unknown) {
    error = (err as Error)?.message ?? "Erro ao carregar moradores.";
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Moradores</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os cadastros de moradores. Aprove ou rejeite solicitações
          pendentes.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Não foi possível carregar os moradores: {error}
        </div>
      )}

      {/* Summary stats */}
      {!error && residents.length > 0 && <SummaryStats residents={residents} />}

      {/* Table */}
      {!error && residents.length === 0 ? (
        <EmptyState />
      ) : !error ? (
        <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Morador
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Apartamento
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <ResidentRow key={resident.id} resident={resident} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
            {residents.length} morador{residents.length !== 1 ? "es" : ""}{" "}
            cadastrado{residents.length !== 1 ? "s" : ""}
          </div>
        </div>
      ) : null}
    </div>
  );
}
