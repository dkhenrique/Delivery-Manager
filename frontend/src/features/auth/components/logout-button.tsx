"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "../actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Saindo..." : "Sair"}
    </Button>
  );
}
