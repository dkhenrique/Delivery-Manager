"use server";

import { redirect } from "next/navigation";
import { getAuthToken, getAuthUser } from "@/lib/auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

// ── Shared: mark onboarding as completed via cookie ────────────────────────

async function markOnboardingCompleted(): Promise<void> {
  const { cookies } = await import("next/headers");
  (await cookies()).set("onboarding_completed", "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

// ── completeOnboardingAction ───────────────────────────────────────────────
// Called from the final step form. Saves apartment_id (if selected), then
// marks onboarding done and redirects.

export type OnboardingState = {
  success: boolean;
  message?: string;
};

export async function completeOnboardingAction(
  prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const apartmentId = formData.get("apartment_id") as string | null;

  if (apartmentId && apartmentId.trim().length > 0) {
    const user = await getAuthUser();
    const token = await getAuthToken();

    if (!user) {
      return {
        success: false,
        message: "Sessão expirada. Faça login novamente.",
      };
    }

    const res = await fetch(`${BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ apartment_id: apartmentId }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
      };
      return {
        success: false,
        message:
          body?.message ?? "Erro ao salvar apartamento. Tente novamente.",
      };
    }
  }

  await markOnboardingCompleted();
  redirect("/dashboard");
}

// ── skipOnboardingAction ───────────────────────────────────────────────────
// Called when user clicks "Configurar depois" or the X close button.

export async function skipOnboardingAction(): Promise<void> {
  await markOnboardingCompleted();
  redirect("/dashboard");
}
