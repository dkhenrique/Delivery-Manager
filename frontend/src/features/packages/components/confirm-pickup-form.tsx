"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { confirmPickupAction, type ConfirmPickupState } from "../actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ─── SubmitButton ─────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Confirmando..." : "Confirmar Retirada"}
    </button>
  );
}

// ─── ConfirmPickupForm ────────────────────────────────────────────────────────

export function ConfirmPickupForm({ packageId }: { packageId: string }) {
  const [state, formAction] = useActionState<ConfirmPickupState, FormData>(
    confirmPickupAction,
    { success: false },
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="packageId" value={packageId} />
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="code" className="text-lg font-medium">
            Código de retirada
          </Label>
          <Input
            id="code"
            name="code"
            placeholder="Digite o código de 6 dígitos"
            className="w-full max-w-xs"
            required
          />
          <p className="text-sm text-muted-foreground">
            Digite o código de retirada de 6 dígitos que foi enviado para o destinatário
          </p>
        </div>
        <div className="pt-4">
          <SubmitButton />
        </div>
      </div>

      {state.message && (
        <div
          role="alert"
          className={`p-4 rounded-md ${state.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {state.message}
        </div>
      )}
    </form>
  );
}
