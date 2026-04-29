import { getAuthUser } from "@/lib/auth";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { LayoutDashboard, Package, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { OnboardingModal } from "@/features/onboarding/components/onboarding-modal";
import { serverFetch } from "@/lib/server-api";

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
  {
    href: "/dashboard/condominiums",
    label: "Condomínios",
    icon: Building2,
    adminOnly: true,
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  const isAdmin = user?.role === "ADMIN";

  // ── Onboarding ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const onboardingCompleted = cookieStore.has("onboarding_completed");
  const shouldShowOnboarding =
    user?.role === "RESIDENT" && !onboardingCompleted;

  let onboardingBlocks: BlockWithApartments[] = [];
  if (shouldShowOnboarding) {
    try {
      onboardingBlocks = await serverFetch<BlockWithApartments[]>("/blocks");
    } catch {
      onboardingBlocks = [];
    }
  }

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-background border-r">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg tracking-tight">
            Delivery Manager
          </span>
        </div>

        {/* Navigation */}
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

        {/* User section */}
        <div className="border-t px-3 py-4 space-y-2">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground truncate">
              {user?.email ?? "—"}
            </p>
            <p className="text-xs font-medium capitalize">
              {user?.role === "ADMIN" ? "Administrador" : "Morador"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-background border-b">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <span className="font-semibold">Delivery Manager</span>
          </div>
          <LogoutButton />
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      {shouldShowOnboarding && <OnboardingModal blocks={onboardingBlocks} />}
    </div>
  );
}
