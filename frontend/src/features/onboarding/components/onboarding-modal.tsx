"use client";

import { useState, useTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import {
  completeOnboardingAction,
  skipOnboardingAction,
  type OnboardingState,
} from "../actions";

// ── Types ──────────────────────────────────────────────────────────────────

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
  condominium: {
    id: string;
    name: string;
    address: string;
  };
  apartments: ApartmentOption[];
}

// ── Step definitions ───────────────────────────────────────────────────────

const STEPS = [
  {
    id: "welcome",
    emoji: "👋",
    title: "Bem-vindo ao DeliveryManager!",
    description:
      "Você está a um passo de nunca mais perder uma encomenda. Este guia rápido mostra tudo que você precisa saber. Vai levar menos de 1 minuto.",
    bgColor: "bg-blue-50",
    emojiColor: "bg-blue-100",
  },
  {
    id: "packages",
    emoji: "📦",
    title: "Suas encomendas, sempre registradas",
    description:
      "Quando uma encomenda chega para o seu apartamento, ela é fotografada e registrada no sistema por quem a recebeu. Tudo documentado com data, foto e código de rastreio.",
    bgColor: "bg-violet-50",
    emojiColor: "bg-violet-100",
  },
  {
    id: "notifications",
    emoji: "🔔",
    title: "Notificações automáticas no seu e-mail",
    description:
      "Assim que a encomenda é registrada, você recebe um e-mail com a foto e as informações da entrega. Nada passa despercebido.",
    bgColor: "bg-orange-50",
    emojiColor: "bg-orange-100",
  },
  {
    id: "code",
    emoji: "🔑",
    title: "Retirada segura com código de 6 dígitos",
    description:
      "Cada encomenda tem um código único incluso no e-mail. Apresente-o na portaria para confirmar a retirada. Simples, rápido e seguro — sem papelada.",
    bgColor: "bg-green-50",
    emojiColor: "bg-green-100",
  },
  {
    id: "profile",
    emoji: "🏠",
    title: "Informe seu apartamento",
    description:
      "Para receber notificações das encomendas certas, informe em qual apartamento você mora. Você pode pular e configurar depois pelo painel.",
    bgColor: "bg-slate-50",
    emojiColor: "bg-slate-100",
    isForm: true,
  },
] as const;

// ── SubmitButton ───────────────────────────────────────────────────────────

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
    >
      {pending ? "Salvando..." : "Salvar e começar"}
      {!pending && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

// ── OnboardingModal ────────────────────────────────────────────────────────

export function OnboardingModal({
  blocks,
}: {
  blocks: BlockWithApartments[];
}) {
  const [step, setStep] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [formState, formAction] = useActionState<OnboardingState, FormData>(
    completeOnboardingAction,
    { success: false },
  );

  const currentStep = STEPS[step];
  const totalSteps = STEPS.length;
  const isLastStep = step === totalSteps - 1;
  const isFirstStep = step === 0;

  const hasBlocks = blocks.length > 0;
  const availableApartments: ApartmentOption[] = selectedBlockId
    ? (blocks.find((b) => b.id === selectedBlockId)?.apartments ?? [])
    : [];

  function handleSkip() {
    startTransition(async () => {
      await skipOnboardingAction();
    });
  }

  function handleNext() {
    if (!isLastStep) setStep((s) => s + 1);
  }

  function handleBack() {
    if (!isFirstStep) setStep((s) => s - 1);
  }

  return (
    // Fixed full-screen overlay — clicking backdrop does NOT close the modal
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header with progress dots and close button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 h-2 bg-blue-600"
                    : i < step
                      ? "w-2 h-2 bg-blue-300"
                      : "w-2 h-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Step counter + close */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">
              {step + 1} / {totalSteps}
            </span>
            <button
              onClick={handleSkip}
              disabled={isPending}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              aria-label="Fechar onboarding"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Step content */}
        {!isLastStep ? (
          // Informational steps (1–4)
          <div
            className={`px-6 py-8 ${currentStep.bgColor} mx-4 mt-4 rounded-2xl mb-4`}
          >
            <div
              className={`w-16 h-16 ${currentStep.emojiColor} rounded-2xl flex items-center justify-center mb-5`}
            >
              <span className="text-3xl">{currentStep.emoji}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
              {currentStep.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentStep.description}
            </p>
          </div>
        ) : (
          // Form step (step 5)
          <div
            className={`px-6 py-8 ${currentStep.bgColor} mx-4 mt-4 rounded-2xl mb-2`}
          >
            <div
              className={`w-16 h-16 ${currentStep.emojiColor} rounded-2xl flex items-center justify-center mb-5`}
            >
              <span className="text-3xl">{currentStep.emoji}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug">
              {currentStep.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {currentStep.description}
            </p>

            {/* Apartment form */}
            <form action={formAction} className="flex flex-col gap-3">
              {/* Block selector (only if blocks exist) */}
              {hasBlocks && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Bloco
                  </label>
                  <select
                    name="block_id"
                    value={selectedBlockId}
                    onChange={(e) => {
                      setSelectedBlockId(e.target.value);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Selecione o bloco</option>
                    {blocks.map((block) => (
                      <option key={block.id} value={block.id}>
                        {block.name}
                        {block.condominium?.name
                          ? ` — ${block.condominium.name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Apartment selector */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="apartment_id"
                  className="text-sm font-medium text-slate-700"
                >
                  Apartamento{" "}
                  {hasBlocks && (
                    <span className="text-slate-400">
                      (selecione o bloco primeiro)
                    </span>
                  )}
                </label>
                <select
                  id="apartment_id"
                  name="apartment_id"
                  disabled={hasBlocks && !selectedBlockId}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Selecione o apartamento</option>
                  {availableApartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      Apto {apt.number}
                      {apt.floor != null ? ` — ${apt.floor}º andar` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error message */}
              {!formState.success && formState.message && (
                <p className="text-sm text-red-600 font-medium">
                  {formState.message}
                </p>
              )}

              {/* Form actions */}
              <div className="flex items-center gap-3 pt-1">
                <SubmitButton />
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isPending}
                  className="text-sm text-slate-500 hover:text-slate-700 hover:underline transition-colors disabled:opacity-50"
                >
                  Configurar depois
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer navigation (informational steps only) */}
        {!isLastStep && (
          <div className="flex items-center justify-between px-6 pb-5">
            <button
              onClick={handleBack}
              disabled={isFirstStep}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-0 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              {step === totalSteps - 2 ? "Finalizar" : "Próximo"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Back button for form step */}
        {isLastStep && (
          <div className="px-6 pb-5">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
