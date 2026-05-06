"use server";

import { getAuthToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export type ResidentActionState = {
  success: boolean;
  message?: string;
};

export async function approveResidentAction(
  _prevState: ResidentActionState,
  formData: FormData,
): Promise<ResidentActionState> {
  const userId = formData.get("userId") as string;
  if (!userId) return { success: false, message: "ID do morador não informado." };

  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}/users/${userId}/approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { message?: string };
    return { success: false, message: errBody?.message ?? "Erro ao aprovar morador." };
  }

  revalidatePath("/dashboard/residents");
  return { success: true, message: "Morador aprovado com sucesso!" };
}

export async function rejectResidentAction(
  _prevState: ResidentActionState,
  formData: FormData,
): Promise<ResidentActionState> {
  const userId = formData.get("userId") as string;
  const rejectionReason = formData.get("rejection_reason") as string;

  if (!userId || !rejectionReason?.trim()) {
    return { success: false, message: "ID e motivo são obrigatórios." };
  }

  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}/users/${userId}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ rejection_reason: rejectionReason.trim() }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { message?: string };
    return { success: false, message: errBody?.message ?? "Erro ao rejeitar morador." };
  }

  revalidatePath("/dashboard/residents");
  return { success: true, message: "Morador rejeitado." };
}

export async function deleteResidentAction(
  _prevState: ResidentActionState,
  formData: FormData,
): Promise<ResidentActionState> {
  const userId = formData.get("userId") as string;
  if (!userId) return { success: false, message: "ID do morador não informado." };

  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { message?: string };
    return { success: false, message: errBody?.message ?? "Erro ao remover morador." };
  }

  revalidatePath("/dashboard/residents");
  return { success: true, message: "Morador removido com sucesso." };
}

export async function updateResidentAction(
  _prevState: ResidentActionState,
  formData: FormData,
): Promise<ResidentActionState> {
  const userId = formData.get("userId") as string;
  const apartmentId = formData.get("apartment_id") as string;

  if (!userId) {
    return { success: false, message: "ID do morador não informado." };
  }

  const token = await getAuthToken();

  const body: Record<string, unknown> = {};
  if (apartmentId) {
    body.apartment_id = apartmentId;
  }

  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      success: false,
      message: errBody?.message ?? "Erro ao atualizar morador.",
    };
  }

  revalidatePath("/dashboard/residents");

  return {
    success: true,
    message: "Morador atualizado com sucesso!",
  };
}
