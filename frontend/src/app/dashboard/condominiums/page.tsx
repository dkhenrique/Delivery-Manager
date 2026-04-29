import { serverFetch } from "@/lib/server-api";
import { getAuthUser, getAuthToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Building2,
  Layers,
  DoorOpen,
  Plus,
  ChevronRight,
  MapPin,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Apartment {
  id: string;
  number: string;
  floor: number | null;
  block_id: string;
  users?: { id: string; name: string; email: string }[];
  created_at: string;
}

interface Block {
  id: string;
  name: string;
  condominium_id: string;
  apartments: Apartment[];
  created_at: string;
}

interface Condominium {
  id: string;
  name: string;
  address: string;
  blocks: Block[];
  created_at: string;
}

// ─── Server Actions ───────────────────────────────────────────────────────────

async function createCondominium(formData: FormData) {
  "use server";

  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  if (!name || !address) return;

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  const token = await getAuthToken();

  await fetch(`${BASE_URL}/condominiums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, address }),
    cache: "no-store",
  });

  revalidatePath("/dashboard/condominiums");
}

async function createBlock(formData: FormData) {
  "use server";

  const condominium_id = formData.get("condominium_id") as string;
  const name = (formData.get("name") as string)?.trim();
  if (!condominium_id || !name) return;

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  const token = await getAuthToken();

  await fetch(`${BASE_URL}/blocks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ condominium_id, name }),
    cache: "no-store",
  });

  revalidatePath("/dashboard/condominiums");
}

async function createApartment(formData: FormData) {
  "use server";

  const block_id = formData.get("block_id") as string;
  const number = (formData.get("number") as string)?.trim();
  const floorStr = formData.get("floor") as string;
  if (!block_id || !number) return;

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  const token = await getAuthToken();

  const body: Record<string, unknown> = { block_id, number };
  if (floorStr) body.floor = Number(floorStr);

  await fetch(`${BASE_URL}/apartments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  revalidatePath("/dashboard/condominiums");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

function SummaryStats({ condominiums }: { condominiums: Condominium[] }) {
  const totalBlocks = condominiums.reduce(
    (acc, c) => acc + c.blocks.length,
    0,
  );
  const totalApartments = condominiums.reduce(
    (acc, c) => acc + c.blocks.reduce((ba, b) => ba + b.apartments.length, 0),
    0,
  );

  const stats = [
    {
      label: "Condomínios",
      value: condominiums.length,
      icon: <Building2 className="h-4 w-4" />,
      style: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    },
    {
      label: "Blocos",
      value: totalBlocks,
      icon: <Layers className="h-4 w-4" />,
      style: "text-violet-700 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",
    },
    {
      label: "Apartamentos",
      value: totalApartments,
      icon: <DoorOpen className="h-4 w-4" />,
      style: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl border p-4 flex flex-col gap-1 ${stat.bg}`}
        >
          <div className="flex items-center justify-between">
            <p className={`text-2xl font-bold ${stat.style}`}>{stat.value}</p>
            <span className={`${stat.style} opacity-60`}>{stat.icon}</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Create Condominium Form ──────────────────────────────────────────────────

function CreateCondominiumForm() {
  return (
    <form
      action={createCondominium}
      className="rounded-xl border bg-background p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Plus className="h-4 w-4 text-primary" />
        Novo Condomínio
      </h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          name="name"
          required
          maxLength={150}
          placeholder="Nome do condomínio"
          aria-label="Nome do condomínio"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="text"
          name="address"
          required
          maxLength={255}
          placeholder="Endereço"
          aria-label="Endereço do condomínio"
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline focus-visible:outline-primary shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          Criar
        </button>
      </div>
    </form>
  );
}

// ─── Add Block Inline Form ────────────────────────────────────────────────────

function AddBlockForm({ condominiumId }: { condominiumId: string }) {
  return (
    <form action={createBlock} className="flex items-center gap-2 mt-3">
      <input type="hidden" name="condominium_id" value={condominiumId} />
      <input
        type="text"
        name="name"
        required
        maxLength={50}
        placeholder="Nome do bloco (ex: Bloco A)"
        aria-label="Nome do novo bloco"
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors focus-visible:outline focus-visible:outline-violet-600 shrink-0"
      >
        <Plus className="h-3 w-3" />
        Bloco
      </button>
    </form>
  );
}

// ─── Add Apartment Inline Form ────────────────────────────────────────────────

function AddApartmentForm({ blockId }: { blockId: string }) {
  return (
    <form action={createApartment} className="flex items-center gap-2 mt-2">
      <input type="hidden" name="block_id" value={blockId} />
      <input
        type="text"
        name="number"
        required
        maxLength={20}
        placeholder="Nº (ex: 101)"
        aria-label="Número do apartamento"
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-24"
      />
      <input
        type="number"
        name="floor"
        min={-5}
        max={100}
        placeholder="Andar"
        aria-label="Andar do apartamento"
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-20"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors focus-visible:outline focus-visible:outline-emerald-600 shrink-0"
      >
        <Plus className="h-3 w-3" />
        Apto
      </button>
    </form>
  );
}

// ─── Apartment Pill ───────────────────────────────────────────────────────────

function ApartmentPill({ apartment }: { apartment: Apartment }) {
  const residents = apartment.users?.length ?? 0;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
      <DoorOpen className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      {apartment.number}
      {apartment.floor != null && (
        <span className="text-muted-foreground">
          · {apartment.floor}º
        </span>
      )}
      {residents > 0 && (
        <span className="text-muted-foreground/70">
          ({residents})
        </span>
      )}
    </span>
  );
}

// ─── Block Section ────────────────────────────────────────────────────────────

function BlockSection({ block }: { block: Block }) {
  return (
    <details className="group rounded-lg border bg-background/50">
      <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none list-none hover:bg-muted/30 transition-colors">
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
        <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
        <span className="text-sm font-medium text-foreground">{block.name}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {block.apartments.length} apto{block.apartments.length !== 1 ? "s" : ""}
        </span>
      </summary>

      <div className="px-4 pb-4 pt-1 border-t">
        {/* Apartments grid */}
        {block.apartments.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-2">
            {block.apartments
              .sort((a, b) => a.number.localeCompare(b.number, "pt-BR", { numeric: true }))
              .map((apt) => (
                <ApartmentPill key={apt.id} apartment={apt} />
              ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/70 mt-2 italic">
            Nenhum apartamento cadastrado neste bloco.
          </p>
        )}

        {/* Add apartment form */}
        <AddApartmentForm blockId={block.id} />
      </div>
    </details>
  );
}

// ─── Condominium Card ─────────────────────────────────────────────────────────

function CondominiumCard({ condominium }: { condominium: Condominium }) {
  const totalApartments = condominium.blocks.reduce(
    (acc, b) => acc + b.apartments.length,
    0,
  );

  return (
    <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b bg-muted/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2 shrink-0 mt-0.5">
              <Building2 className="h-5 w-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">
                {condominium.name}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{condominium.address}</span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">
              {condominium.blocks.length} bloco{condominium.blocks.length !== 1 ? "s" : ""}
              {" · "}
              {totalApartments} apto{totalApartments !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Criado em {formatDate(condominium.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Blocks */}
      <div className="p-4 space-y-2">
        {condominium.blocks.length > 0 ? (
          condominium.blocks
            .sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { numeric: true }))
            .map((block) => (
              <BlockSection key={block.id} block={block} />
            ))
        ) : (
          <p className="text-xs text-muted-foreground/70 italic py-2 text-center">
            Nenhum bloco cadastrado neste condomínio.
          </p>
        )}

        {/* Add block form */}
        <AddBlockForm condominiumId={condominium.id} />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background py-16 text-center">
      <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-sm font-medium text-muted-foreground">
        Nenhum condomínio cadastrado
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Crie o primeiro condomínio usando o formulário acima.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CondominiumsPage() {
  const user = await getAuthUser();

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let condominiums: Condominium[] = [];
  let error: string | null = null;

  try {
    condominiums = await serverFetch<Condominium[]>("/condominiums");

    // The condominiums endpoint returns blocks but not apartments.
    // We fetch full blocks with apartments and merge the data.
    const blocks = await serverFetch<Block[]>("/blocks");
    const blockMap = new Map(blocks.map((b) => [b.id, b]));

    condominiums = condominiums.map((c) => ({
      ...c,
      blocks: c.blocks.map((b) => blockMap.get(b.id) ?? { ...b, apartments: [] }),
    }));
  } catch (err: unknown) {
    error = (err as Error)?.message ?? "Erro ao carregar condomínios.";
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Condomínios</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie condomínios, blocos e apartamentos do sistema.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Não foi possível carregar os condomínios: {error}
        </div>
      )}

      {/* Summary stats */}
      {!error && condominiums.length > 0 && (
        <SummaryStats condominiums={condominiums} />
      )}

      {/* Create form */}
      {!error && <CreateCondominiumForm />}

      {/* Condominiums list */}
      {!error && condominiums.length === 0 ? (
        <EmptyState />
      ) : !error ? (
        <div className="space-y-6">
          {condominiums.map((condo) => (
            <CondominiumCard key={condo.id} condominium={condo} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
