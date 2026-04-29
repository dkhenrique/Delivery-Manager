import { getAuthUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { CreatePackageForm } from "@/features/packages/components/create-package-form";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

// ─── Types (mirror from create-package-form) ──────────────────────────────────

interface ApartmentOption {
  id: string;
  number: string;
  floor: number | null;
  block_id: string;
}

interface BlockWithApartments {
  id: string;
  name: string;
  condominium_id: string;
  condominium: { id: string; name: string; address: string };
  apartments: ApartmentOption[];
}

// ─── Page wrapper (declared at module scope — never inside render) ─────────────

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/packages"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Registrar Encomenda
        </h1>
        <p className="text-sm text-muted-foreground">
          Registre uma encomenda que chegou para outro apartamento e está sob
          sua guarda.
        </p>
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NovaEncomendaPage() {
  const user = await getAuthUser();
  const isApproved = user?.status === "APPROVED" || user?.role === "ADMIN";

  // ── Not approved ───────────────────────────────────────────────────────────

  if (!isApproved) {
    return (
      <PageWrapper>
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-6 flex items-start gap-4 max-w-lg">
          <Lock className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
              Ação restrita
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              Seu cadastro precisa estar <strong>aprovado</strong> pelo
              administrador para registrar encomendas. Aguarde a aprovação ou
              entre em contato com o síndico.
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── Fetch blocks ───────────────────────────────────────────────────────────

  let blocks: BlockWithApartments[] = [];
  try {
    blocks = await serverFetch<BlockWithApartments[]>("/blocks");
  } catch {
    blocks = [];
  }

  return (
    <PageWrapper>
      <div className="max-w-xl">
        <div className="rounded-xl border bg-background shadow-sm p-6">
          <CreatePackageForm blocks={blocks} />
        </div>
      </div>
    </PageWrapper>
  );
}
