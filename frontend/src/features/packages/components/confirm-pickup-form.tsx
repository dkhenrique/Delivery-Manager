"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { confirmPickupAction, type ConfirmPickupState } from "../actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

// ─── SubmitButton ─────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      <ShieldCheck className="mr-2 h-5 w-5" />
      {pending ? "Validando Código..." : "Confirmar Retirada"}
    </Button>
  );
}

// ─── ConfirmPickupForm ────────────────────────────────────────────────────────

export function ConfirmPickupForm({ packageId }: { packageId: string }) {
  const [state, formAction] = useActionState<ConfirmPickupState, FormData>(
    confirmPickupAction,
    { success: false },
  );
  const [codeValue, setCodeValue] = useState("");
  const isComplete = codeValue.length === 6;

  if (state.success) {
    return (
      <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 p-8 text-center flex flex-col items-center gap-4 shadow-sm animate-in fade-in zoom-in duration-500">
        <div className="h-16 w-16 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-green-800 dark:text-green-300">Retirada Confirmada!</p>
          <p className="text-sm text-green-700/80 dark:text-green-400/80">
            {state.message || "A encomenda foi entregue ao morador com sucesso."}
          </p>
        </div>
        <Link 
          href="/dashboard/packages"
          className={buttonVariants({ className: "mt-4 bg-green-600 hover:bg-green-700 text-white w-full h-10" })}
        >
          Voltar para a Lista
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="packageId" value={packageId} />
      
      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor="code" className="text-base font-semibold text-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-blue-500" />
            Código de Segurança
          </Label>
          <Input
            id="code"
            name="code"
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Ex: 123456"
            className={`w-full text-center text-3xl tracking-[0.3em] h-16 font-mono font-medium transition-colors bg-background ${
              isComplete
                ? "border-green-500 ring-2 ring-green-500/20 focus-visible:ring-green-500"
                : "focus-visible:ring-blue-500"
            }`}
            required
            maxLength={6}
            autoComplete="off"
            aria-describedby="code-help"
          />
          <p id="code-help" className="text-sm text-muted-foreground">
            Solicite ao morador o código de 6 dígitos que ele recebeu.
          </p>
        </div>
        
        <div className="pt-2">
          <SubmitButton />
        </div>
      </div>

      {state.message && (
        <div
          role="alert"
          className="p-4 rounded-lg flex items-center gap-3 text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-900/50"
        >
          {state.message}
        </div>
      )}
    </form>
  );
}
