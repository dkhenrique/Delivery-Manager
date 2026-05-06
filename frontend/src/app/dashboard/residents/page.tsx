import { serverFetch } from "@/lib/server-api";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ResidentsTable,
  type Resident,
  type ApartmentOption,
} from "@/features/residents/components/residents-table";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlockWithApartments {
  id: string;
  name: string;
  apartments: {
    id: string;
    number: string;
    floor: number | null;
  }[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResidentsPage() {
  const user = await getAuthUser();

  // Only admins can access this page
  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let residents: Resident[] = [];
  let apartments: ApartmentOption[] = [];
  let error: string | null = null;

  try {
    residents = await serverFetch<Resident[]>("/users");
  } catch (err: unknown) {
    error = (err as Error)?.message ?? "Erro ao carregar moradores.";
  }

  // Fetch apartments for the edit modal
  try {
    const blocks = await serverFetch<BlockWithApartments[]>("/blocks");
    apartments = blocks.flatMap((block) =>
      block.apartments.map((apt) => ({
        id: apt.id,
        number: apt.number,
        floor: apt.floor,
        blockName: block.name,
      })),
    );
  } catch {
    apartments = [];
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Moradores</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os cadastros de moradores. Aprove, rejeite, edite ou
          remova moradores.
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          Não foi possível carregar os moradores: {error}
        </div>
      )}

      {/* Table with filters */}
      {!error && (
        <ResidentsTable residents={residents} apartments={apartments} />
      )}
    </div>
  );
}
