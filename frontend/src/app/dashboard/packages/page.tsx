import { serverFetch } from "@/lib/server-api";
import { getAuthUser } from "@/lib/auth";
import { Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type PackageStatus = "WAITING_PICKUP" | "DELIVERED" | "OVERDUE";

interface PickupCodeInfo {
  code: string;
  expires_at: string;
}

interface PackageItem {
  id: string;
  description: string | null;
  photo_url: string | null;
  status: PackageStatus;
  storage_deadline: string; // DATE "2026-05-06"
  delivered_at: string | null;
  created_at: string;
  received_by_user: {
    id: string;
    name: string;
    email: string;
  } | null;
  recipient_apartment: {
    id: string;
    number: string;
    block: { id: string; name: string } | null;
  } | null;
  pickup_code: PickupCodeInfo | null;
}

// ─── Status maps ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<PackageStatus, string> = {
  WAITING_PICKUP: "Aguardando Retirada",
  DELIVERED: "Retirado",
  OVERDUE: "Prazo Vencido",
};

const STATUS_STYLES: Record<PackageStatus, string> = {
  WAITING_PICKUP:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  DELIVERED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_ICONS: Record<PackageStatus, React.ReactNode> = {
  WAITING_PICKUP: <Clock className="h-3.5 w-3.5" />,
  DELIVERED: <CheckCircle2 className="h-3.5 w-3.5" />,
  OVERDUE: <AlertCircle className="h-3.5 w-3.5" />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDeadline(dateStr: string) {
  // Append T00:00:00 to avoid timezone shift when parsing a DATE-only string
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function aptLabel(pkg: PackageItem): string {
  if (!pkg.recipient_apartment) return "—";
  const block = pkg.recipient_apartment.block
    ? ` — Bloco ${pkg.recipient_apartment.block.name}`
    : "";
  return `Apto ${pkg.recipient_apartment.number}${block}`;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PackageStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── PickupCode pill ──────────────────────────────────────────────────────────

function PickupCodeCell({ pkg }: { pkg: PackageItem }) {
  if (pkg.status === "WAITING_PICKUP" && pkg.pickup_code) {
    return (
      <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs tracking-widest">
        {pkg.pickup_code.code}
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-16 text-center">
      <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">
        Nenhuma encomenda encontrada
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        As encomendas registradas aparecerão aqui.
      </p>
    </div>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────

function AdminPackageRow({ pkg }: { pkg: PackageItem }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm text-foreground">{aptLabel(pkg)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {pkg.description ?? "—"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={pkg.status} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDeadline(pkg.storage_deadline)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {pkg.received_by_user?.name ?? "—"}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(pkg.created_at)}
      </td>
    </tr>
  );
}

function MyPackageRow({ pkg }: { pkg: PackageItem }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm text-foreground">{aptLabel(pkg)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {pkg.description ?? "—"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={pkg.status} />
      </td>
      <td className="px-4 py-3">
        <PickupCodeCell pkg={pkg} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDeadline(pkg.storage_deadline)}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(pkg.created_at)}
      </td>
    </tr>
  );
}

function GuardedPackageRow({ pkg }: { pkg: PackageItem }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 text-sm text-foreground">{aptLabel(pkg)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {pkg.description ?? "—"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={pkg.status} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDeadline(pkg.storage_deadline)}
      </td>
      <td className="px-4 py-3">
        <PickupCodeCell pkg={pkg} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(pkg.created_at)}
      </td>
    </tr>
  );
}

// ─── PackageList ──────────────────────────────────────────────────────────────

type PackageListVariant = "admin" | "my" | "guarded";

const COLUMN_HEADERS: Record<PackageListVariant, string[]> = {
  admin: [
    "Apartamento",
    "Descrição",
    "Status",
    "Prazo",
    "Guardado por",
    "Registrado em",
  ],
  my: [
    "Apartamento",
    "Descrição",
    "Status",
    "Código",
    "Prazo",
    "Registrado em",
  ],
  guarded: [
    "Apartamento destino",
    "Descrição",
    "Status",
    "Prazo de guarda",
    "Código",
    "Registrado em",
  ],
};

async function PackageList({
  endpoint,
  variant,
}: {
  endpoint: string;
  variant: PackageListVariant;
}) {
  let packages: PackageItem[] = [];
  let error: string | null = null;

  try {
    packages = await serverFetch<PackageItem[]>(endpoint);
  } catch (err: unknown) {
    error = (err as Error)?.message ?? "Erro ao carregar encomendas.";
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as encomendas: {error}
      </div>
    );
  }

  if (packages.length === 0) {
    return <EmptyState />;
  }

  const headers = COLUMN_HEADERS[variant];

  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-muted/50">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => {
              if (variant === "admin")
                return <AdminPackageRow key={pkg.id} pkg={pkg} />;
              if (variant === "guarded")
                return <GuardedPackageRow key={pkg.id} pkg={pkg} />;
              return <MyPackageRow key={pkg.id} pkg={pkg} />;
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
        {packages.length} encomenda{packages.length !== 1 ? "s" : ""} encontrada
        {packages.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PackagesPage() {
  const user = await getAuthUser();
  const isAdmin = user?.role === "ADMIN";
  const isApprovedResident =
    user?.role === "RESIDENT" && user?.status === "APPROVED";

  // Both admins and approved residents can register packages
  const canRegister = isAdmin || isApprovedResident;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Encomendas</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Lista de todas as encomendas registradas no sistema."
              : "Acompanhe as encomendas destinadas ao seu apartamento."}
          </p>
        </div>
        {canRegister && (
          <Link
            href="/dashboard/packages/nova"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="h-4 w-4" />
            Registrar encomenda
          </Link>
        )}
      </div>

      {/* Pending resident alert */}
      {!isAdmin && !isApprovedResident && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Seu cadastro está pendente de aprovação. Após a aprovação você
            poderá registrar encomendas.
          </p>
        </div>
      )}

      {/* Admin: all packages */}
      {isAdmin && <PackageList endpoint="/packages" variant="admin" />}

      {/* Residents: packages destined to their apartment */}
      {!isAdmin && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold tracking-tight">
            Destinadas ao meu apartamento
          </h2>
          <PackageList endpoint="/packages/my" variant="my" />
        </div>
      )}

      {/* Approved residents: packages they are guarding */}
      {isApprovedResident && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold tracking-tight">
            Encomendas que estou guardando
          </h2>
          <PackageList endpoint="/packages/guarded" variant="guarded" />
        </div>
      )}
    </div>
  );
}
