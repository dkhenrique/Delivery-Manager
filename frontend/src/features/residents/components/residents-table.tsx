"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Trash2,
  Pencil,
  X,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Resident {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  status: UserStatus;
  rejection_reason: string | null;
  created_at: string;
  apartment?: {
    id?: string;
    number: string;
    block: string | null;
  } | null;
}

export interface ApartmentOption {
  id: string;
  number: string;
  floor: number | null;
  blockName: string;
}

// ─── Server Action Types ──────────────────────────────────────────────────────

import {
  approveResidentAction,
  rejectResidentAction,
  deleteResidentAction,
  updateResidentAction,
  type ResidentActionState,
} from "./residents-actions";

// ─── Status maps ──────────────────────────────────────────────────────────────

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

type FilterTab = "ALL" | UserStatus;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovados" },
  { value: "REJECTED", label: "Rejeitados" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── SubmitButton ─────────────────────────────────────────────────────────────

function PendingButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

function ApproveForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<ResidentActionState, FormData>(
    approveResidentAction,
    { success: false },
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <PendingButton
        pendingText="Aprovando…"
        className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors focus-visible:outline focus-visible:outline-green-600 disabled:opacity-50"
      >
        <UserCheck className="h-3.5 w-3.5" />
        Aprovar
      </PendingButton>
    </form>
  );
}

function RejectForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<ResidentActionState, FormData>(
    rejectResidentAction,
    { success: false },
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="flex items-start gap-2">
      <input type="hidden" name="userId" value={userId} />
      <input
        type="text"
        name="rejection_reason"
        required
        minLength={3}
        placeholder="Motivo da rejeição…"
        className="rounded-md border border-input bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/50 w-44"
      />
      <PendingButton
        pendingText="Rejeitando…"
        className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors focus-visible:outline focus-visible:outline-destructive shrink-0 disabled:opacity-50"
      >
        <XCircle className="h-3.5 w-3.5" />
        Rejeitar
      </PendingButton>
    </form>
  );
}

function DeleteForm({ userId, name }: { userId: string; name: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction] = useActionState<ResidentActionState, FormData>(
    deleteResidentAction,
    { success: false },
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        // Defer state update to avoid synchronous setState during render/effect
        const timer = setTimeout(() => setShowConfirm(false), 0);
        return () => clearTimeout(timer);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline focus-visible:outline-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Remover
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
      <p className="text-xs text-destructive font-medium">
        Remover <strong>{name}</strong>? Esta ação é irreversível.
      </p>
      <div className="flex items-center gap-2">
        <form action={formAction}>
          <input type="hidden" name="userId" value={userId} />
          <PendingButton
            pendingText="Removendo…"
            className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Confirmar
          </PendingButton>
        </form>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditResidentModal({
  resident,
  apartments,
  onClose,
}: {
  resident: Resident;
  apartments: ApartmentOption[];
  onClose: () => void;
}) {
  const [state, formAction] = useActionState<ResidentActionState, FormData>(
    updateResidentAction,
    { success: false },
  );

  if (state.success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-label="Morador atualizado">
        <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              {state.message || "Morador atualizado com sucesso!"}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors mt-2"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 id="edit-modal-title" className="text-base font-semibold">Editar Morador</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="userId" value={resident.id} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-name" className="text-xs font-medium text-muted-foreground">
              Nome
            </label>
            <p id="edit-name" className="text-sm font-medium">{resident.name}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-email" className="text-xs font-medium text-muted-foreground">
              E-mail
            </label>
            <p id="edit-email" className="text-sm">{resident.email}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-apartment" className="text-xs font-medium text-muted-foreground">
              Apartamento
            </label>
            <select
              id="edit-apartment"
              name="apartment_id"
              defaultValue={resident.apartment?.id ?? ""}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Sem apartamento</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  Apto {apt.number} — Bloco {apt.blockName}
                </option>
              ))}
            </select>
          </div>

          {state.message && !state.success && (
            <div className="p-3 rounded-lg bg-destructive/10 text-xs text-destructive font-medium">
              {state.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <PendingButton
              pendingText="Salvando…"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Salvar
            </PendingButton>
          </div>
        </form>
      </div>
    </div>
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

// ─── Resident Row ─────────────────────────────────────────────────────────────

function ResidentRow({
  resident,
  apartments,
}: {
  resident: Resident;
  apartments: ApartmentOption[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  const apartment = resident.apartment
    ? `Apto ${resident.apartment.number}${resident.apartment.block ? ` — Bloco ${resident.apartment.block}` : ""}`
    : "—";

  const isPending = resident.status === "PENDING";

  return (
    <>
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
          <div className="flex flex-col gap-2">
            {isPending && (
              <>
                <ApproveForm userId={resident.id} />
                <RejectForm userId={resident.id} />
              </>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-ring"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
              {resident.role !== "ADMIN" && (
                <DeleteForm userId={resident.id} name={resident.name} />
              )}
            </div>
          </div>
        </td>
      </tr>

      {editOpen && (
        <EditResidentModal
          resident={resident}
          apartments={apartments}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-16 text-center">
      <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">
        Nenhum morador encontrado
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Os moradores registrados aparecerão aqui.
      </p>
    </div>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────────────

export function ResidentsTable({
  residents,
  apartments,
}: {
  residents: Resident[];
  apartments: ApartmentOption[];
}) {
  const [filter, setFilter] = useState<FilterTab>("ALL");

  const counts: Record<FilterTab, number> = {
    ALL: residents.length,
    PENDING: residents.filter((r) => r.status === "PENDING").length,
    APPROVED: residents.filter((r) => r.status === "APPROVED").length,
    REJECTED: residents.filter((r) => r.status === "REJECTED").length,
  };

  const filtered =
    filter === "ALL"
      ? residents
      : residents.filter((r) => r.status === filter);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Stats */}
      {residents.length > 0 && <SummaryStats residents={residents} />}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1 w-fit" role="tablist" aria-label="Filtrar por status">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={filter === tab.value}
            onClick={() => setFilter(tab.value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex items-center justify-center min-w-5 h-5 rounded-full px-1.5 text-[10px] font-semibold ${
                filter === tab.value
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
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
                {filtered.map((resident) => (
                  <ResidentRow
                    key={resident.id}
                    resident={resident}
                    apartments={apartments}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
            {filtered.length} morador{filtered.length !== 1 ? "es" : ""}{" "}
            {filter !== "ALL" ? `(${STATUS_LABELS[filter as UserStatus].toLowerCase()})` : ""}
          </div>
        </div>
      )}
    </div>
  );
}
