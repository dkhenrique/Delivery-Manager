"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPackageAction, type CreatePackageState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Package, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── SubmitButton ─────────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Registrando..." : "Registrar encomenda"}
    </Button>
  );
}

// ─── CreatePackageForm ────────────────────────────────────────────────────────

export function CreatePackageForm({
  blocks,
}: {
  blocks: BlockWithApartments[];
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [state, formAction] = useActionState<CreatePackageState, FormData>(
    createPackageAction,
    { success: false },
  );

  const availableApartments: ApartmentOption[] = selectedBlockId
    ? (blocks.find((b) => b.id === selectedBlockId)?.apartments ?? [])
    : blocks.length === 0
      ? []
      : [];

  // ── Success panel ──────────────────────────────────────────────────────────

  if (state.success) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900">
                Encomenda registrada!
              </p>
              <p className="text-sm text-green-700">{state.message}</p>
            </div>
          </div>

          {state.pickupCode && (
            <div className="rounded-xl border border-green-300 bg-white p-4 flex flex-col items-center gap-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Código de retirada
              </p>
              <p className="text-4xl font-bold tracking-[0.35em] text-slate-900 font-mono">
                {state.pickupCode}
              </p>
              <p className="text-xs text-slate-500 text-center">
                Este código foi enviado por e-mail para os moradores do
                apartamento destinatário.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/packages/nova"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Package className="h-4 w-4" />
            Registrar outra encomenda
          </Link>
          <Link
            href="/dashboard/packages"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Ver lista de encomendas
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Block selector — only when there are multiple blocks */}
      {blocks.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="block_id">Bloco</Label>
          <select
            id="block_id"
            value={selectedBlockId}
            onChange={(e) => {
              setSelectedBlockId(e.target.value);
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors"
          >
            <option value="">Selecione o bloco</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {b.condominium?.name ? ` — ${b.condominium.name}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Apartment selector */}
      <div className="space-y-2">
        <Label htmlFor="recipient_apartment_id">
          Apartamento destinatário *
        </Label>
        <select
          id="recipient_apartment_id"
          name="recipient_apartment_id"
          required
          disabled={blocks.length > 0 && !selectedBlockId}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Selecione o apartamento</option>
          {availableApartments.map((apt) => (
            <option key={apt.id} value={apt.id}>
              Apto {apt.number}
              {apt.floor != null ? ` — ${apt.floor}º andar` : ""}
            </option>
          ))}
        </select>
        {state?.errors?.recipient_apartment_id && (
          <p className="text-sm text-destructive font-medium">
            {state.errors.recipient_apartment_id[0]}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descrição{" "}
          <span className="text-muted-foreground font-normal">(opcional)</span>
        </Label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          placeholder="Ex: Caixa dos Correios, etiqueta azul, tamanho médio..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors resize-none"
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive font-medium">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {/* Storage deadline days */}
      <div className="space-y-2">
        <Label htmlFor="storage_deadline_days">Prazo de guarda (dias) *</Label>
        <div className="flex items-center gap-3">
          <Input
            id="storage_deadline_days"
            name="storage_deadline_days"
            type="number"
            min={1}
            max={30}
            defaultValue={7}
            required
            className="w-28"
          />
          <p className="text-xs text-muted-foreground">
            Entre 1 e 30 dias. Padrão: 7 dias.
          </p>
        </div>
        {state?.errors?.storage_deadline_days && (
          <p className="text-sm text-destructive font-medium">
            {state.errors.storage_deadline_days[0]}
          </p>
        )}
      </div>

      {/* Global error message */}
      {!state?.success && state?.message && (
        <p className="text-sm text-destructive font-medium">{state.message}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton />
        <Link
          href="/dashboard/packages"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
