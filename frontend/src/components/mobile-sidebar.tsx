"use client";

import { useState } from "react";
import { Menu, Package, LayoutDashboard, Users, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { LogoutButton } from "@/features/auth/components/logout-button";

interface MobileSidebarProps {
  isAdmin: boolean;
  userEmail: string;
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

export function MobileSidebar({ isAdmin, userEmail }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-background border-b">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <span className="font-semibold">Delivery Manager</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Abrir menu de navegação" />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0" showCloseButton>
          {/* Header */}
          <SheetHeader className="border-b px-6 py-5">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              <SheetTitle className="font-semibold text-lg tracking-tight">
                Delivery Manager
              </SheetTitle>
            </div>
            <SheetDescription className="sr-only">
              Menu de navegação do Delivery Manager
            </SheetDescription>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1" role="navigation" aria-label="Menu principal">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t px-3 py-4 space-y-2 mt-auto">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground truncate">
                {userEmail}
              </p>
              <p className="text-xs font-medium capitalize">
                {isAdmin ? "Administrador" : "Morador"}
              </p>
            </div>
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
