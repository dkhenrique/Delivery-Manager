import { serverFetch } from "@/lib/server-api";
import { getAuthUser } from "@/lib/auth";
import { Users, Package, Clock, TrendingUp } from "lucide-react";

interface DashboardMetrics {
  pendingResidents: number;
  awaitingPickupPackages: number;
  receivedTodayPackages: number;
}

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

async function AdminMetrics() {
  let metrics: DashboardMetrics | null = null;
  let error: string | null = null;

  try {
    metrics = await serverFetch<DashboardMetrics>("/dashboard/metrics");
  } catch (err: unknown) {
    error = (err as Error)?.message ?? "Erro ao carregar métricas.";
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as métricas: {error}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      title: "Cadastros Pendentes",
      value: metrics.pendingResidents,
      description: "Moradores aguardando aprovação",
      icon: <Users className="h-5 w-5" />,
      highlight: metrics.pendingResidents > 0,
    },
    {
      title: "Encomendas Aguardando Retirada",
      value: metrics.awaitingPickupPackages,
      description: "Pacotes ainda não retirados",
      icon: <Package className="h-5 w-5" />,
      highlight: false,
    },
    {
      title: "Recebidas Hoje",
      value: metrics.receivedTodayPackages,
      description: "Encomendas registradas nas últimas 24h",
      icon: <TrendingUp className="h-5 w-5" />,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}

function ResidentWelcome() {
  return (
    <div className="rounded-xl border bg-background p-6 shadow-sm flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Suas Encomendas</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe o status das suas encomendas no menu lateral.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getAuthUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {isAdmin ? "Painel Administrativo" : "Bem-vindo"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Visão geral do sistema de gerenciamento de encomendas."
            : "Gerencie suas encomendas e acompanhe o status de retirada."}
        </p>
      </div>

      {/* Status badge */}
      {user?.status === "PENDING" && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-400/40 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            Seu cadastro está <strong>pendente de aprovação</strong> pelo
            administrador. Algumas funcionalidades podem estar indisponíveis.
          </span>
        </div>
      )}

      {/* Content based on role */}
      {isAdmin ? <AdminMetrics /> : <ResidentWelcome />}
    </div>
  );
}
