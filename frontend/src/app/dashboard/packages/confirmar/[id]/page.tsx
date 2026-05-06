import { getAuthUser } from "@/lib/auth";
import { serverFetch } from "@/lib/server-api";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle2, AlertCircle, MapPin, Calendar, Fingerprint } from "lucide-react";
import { ConfirmPickupForm } from "@/features/packages/components/confirm-pickup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────

type PackageStatus = "WAITING_PICKUP" | "DELIVERED" | "OVERDUE";

interface PackageDetails {
  id: string;
  description: string | null;
  status: PackageStatus;
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

// ─── Status Maps ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<PackageStatus, string> = {
  WAITING_PICKUP: "Aguardando Retirada",
  DELIVERED: "Retirado",
  OVERDUE: "Prazo Vencido",
};

const STATUS_STYLES: Record<PackageStatus, string> = {
  WAITING_PICKUP:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900/50",
  DELIVERED:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/50",
  OVERDUE: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50",
};

const STATUS_ICONS: Record<PackageStatus, React.ReactNode> = {
  WAITING_PICKUP: <Clock className="h-4 w-4" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4" />,
  OVERDUE: <AlertCircle className="h-4 w-4" />,
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

function aptLabel(pkg: PackageDetails): string {
  if (!pkg.recipient_apartment) return "—";
  const block = pkg.recipient_apartment.block
    ? ` — Bloco ${pkg.recipient_apartment.block.name}`
    : "";
  return `Apto ${pkg.recipient_apartment.number}${block}`;
}

// ─── Page Component (Server Component) ───────────────────────────────────────

export default async function ConfirmPickupPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const user = await getAuthUser();
  const isAdmin = user?.role === "ADMIN";
  const isApprovedResident = user?.role === "RESIDENT" && user?.status === "APPROVED";

  // Verificar se o usuário é admin ou morador aprovado
  if (!isAdmin && !isApprovedResident) {
    redirect("/dashboard");
  }

  let pkg: PackageDetails | null = null;
  let error: string | null = null;

  const { id } = await params;

  try {
    pkg = await serverFetch<PackageDetails>(`/packages/${id}`);
  } catch {
    error = "Erro ao carregar encomenda";
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <Link
          href="/dashboard/packages"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:underline transition-all mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para encomendas
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Confirmar Retirada</h1>
          <p className="text-muted-foreground text-lg">
            Verifique as informações do pacote e insira o código de retirada para liberar a encomenda.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto mt-12 shadow-sm">
          <div className="h-14 w-14 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-destructive">Falha ao carregar</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex gap-3 mt-4 w-full justify-center">
            <Link 
              href="/dashboard/packages"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 flex-1 max-w-[140px]"
            >
              Voltar
            </Link>
            <Link 
              href={`/dashboard/packages/confirmar/${id}`}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 flex-1 max-w-[140px]"
            >
              Tentar Novamente
            </Link>
          </div>
        </div>
      ) : (
        pkg && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Detalhes da Encomenda */}
            <Card className="lg:col-span-2 shadow-md border-muted/60 overflow-hidden">
              <CardHeader className="pb-5 border-b border-muted/40 bg-muted/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Detalhes da Encomenda</CardTitle>
                      <CardDescription className="font-mono mt-1 text-sm">{pkg.id}</CardDescription>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold shadow-sm ${STATUS_STYLES[pkg.status]}`}>
                    {STATUS_ICONS[pkg.status]}
                    {STATUS_LABELS[pkg.status]}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Package className="h-4 w-4 text-primary" />
                      Descrição
                    </div>
                    <p className="text-lg font-medium">{pkg.description || "Sem descrição registrada"}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      Destinatário
                    </div>
                    <p className="text-lg font-medium">{aptLabel(pkg)}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      Data de Registro
                    </div>
                    <p className="text-lg font-medium">{formatDate(pkg.created_at)}</p>
                  </div>

                  {pkg.received_by_user && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Fingerprint className="h-4 w-4 text-primary" />
                        Recebido por (Portaria)
                      </div>
                      <p className="text-lg font-medium">{pkg.received_by_user.name}</p>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* Ação de Confirmação */}
            <div className="flex flex-col gap-4">
              <Card className="shadow-lg border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50/80 to-transparent dark:from-blue-950/40 dark:to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Liberação</CardTitle>
                  <CardDescription className="text-sm">
                    {pkg.status === "WAITING_PICKUP" 
                      ? "Insira o código informado pelo morador para concluir a entrega de forma segura."
                      : "Esta encomenda não permite mais confirmação."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pkg.status === "WAITING_PICKUP" ? (
                    <ConfirmPickupForm packageId={id} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-background/60 p-8 text-center flex flex-col items-center gap-3 shadow-inner">
                      {pkg.status === "DELIVERED" ? (
                        <>
                          <CheckCircle2 className="h-12 w-12 text-green-500 mb-2 drop-shadow-sm" />
                          <p className="text-base font-semibold text-foreground">Pacote Entregue</p>
                          <p className="text-sm text-muted-foreground">Esta encomenda já foi retirada com sucesso.</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-12 w-12 text-red-500 mb-2 drop-shadow-sm" />
                          <p className="text-base font-semibold text-foreground">Prazo Expirado</p>
                          <p className="text-sm text-muted-foreground">O prazo de guarda desta encomenda foi excedido.</p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )
      )}
    </div>
  );
}