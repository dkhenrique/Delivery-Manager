import { getAuthUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { ConfirmPickupForm } from "@/features/packages/components/confirm-pickup-form";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PackageDetails {
  id: string;
  description: string | null;
  status: "WAITING_PICKUP" | "DELIVERED" | "OVERDUE";
  storage_deadline: string;
  created_at: string;
  recipient_apartment: {
    id: string;
    number: string;
    block: { id: string; name: string } | null;
  } | null;
  pickup_code: {
    code: string;
    expires_at: string;
  } | null;
  received_by_user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// ─── Page Component (Server Component) ───────────────────────────────────────

export default async function ConfirmPickupPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const user = await getAuthUser();
  
  // Verificar se o usuário é admin
  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  let pkg: PackageDetails | null = null;
  let error: string | null = null;

  try {
    pkg = await serverFetch<PackageDetails>(`/packages/${params.id}`);
  } catch {
    error = "Erro ao carregar encomenda";
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/packages"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para encomendas
        </Link>
      </div>
      
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Confirmar Retirada
        </h1>
        <p className="text-sm text-muted-foreground">
          Confirme a retirada de encomendas usando o código de 6 dígitos
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        pkg && (
          <div className="max-w-2xl">
            <div className="rounded-xl border bg-background shadow-sm p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold">Encomenda #{pkg.id}</h2>
                    <p className="text-sm text-muted-foreground">
                      {pkg.description || "Sem descrição"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Detalhes da encomenda</h3>
                    <div className="text-sm">
                      <p><strong>Descrição:</strong> {pkg.description || "Sem descrição"}</p>
                      <p><strong>Apartamento:</strong> {pkg.recipient_apartment?.number} {pkg.recipient_apartment?.block ? `- Bloco ${pkg.recipient_apartment.block.name}` : ""}</p>
                      <p><strong>Status:</strong> {pkg.status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Confirmar retirada</h3>
                    <ConfirmPickupForm packageId={params.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}