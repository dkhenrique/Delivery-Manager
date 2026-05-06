"use server";

import { getAuthToken } from "@/lib/auth";
import { createPackageSchema } from "./schemas";
import { revalidatePath } from "next/cache";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export type CreatePackageState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
  pickupCode?: string;
  packageId?: string;
};

export type ConfirmPickupState = {
  success: boolean;
  message?: string;
};

export type ResendCodeState = {
  success: boolean;
  message?: string;
};

export type UploadPhotoState = {
  success: boolean;
  message?: string;
};

export async function createPackageAction(
  prevState: CreatePackageState,
  formData: FormData,
): Promise<CreatePackageState> {
  const raw = {
    recipient_apartment_id: formData.get("recipient_apartment_id") as string,
    storage_deadline_days: formData.get("storage_deadline_days") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const validated = createPackageSchema.safeParse(raw);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Verifique os campos e tente novamente.",
    };
  }

  const token = await getAuthToken();

  const body: Record<string, unknown> = {
    recipient_apartment_id: validated.data.recipient_apartment_id,
    storage_deadline_days: validated.data.storage_deadline_days,
  };
  if (validated.data.description) {
    body.description = validated.data.description;
  }

  const res = await fetch(`${BASE_URL}/packages`, {
    method: "POST",
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
      message:
        errBody?.message ?? "Erro ao registrar encomenda. Tente novamente.",
    };
  }

  const pkg = (await res.json()) as {
    id: string;
    pickup_code?: { code: string };
  };

  revalidatePath("/dashboard/packages");

  return {
    success: true,
    message:
      "Encomenda registrada com sucesso! O morador será notificado por e-mail com o código de retirada.",
    pickupCode: pkg.pickup_code?.code,
    packageId: pkg.id,
  };
}

export async function confirmPickupAction(
  prevState: ConfirmPickupState,
  formData: FormData,
): Promise<ConfirmPickupState> {
  const packageId = formData.get("packageId") as string;
  const code = formData.get("code") as string;

  if (!packageId || !code) {
    return { success: false, message: "Dados inválidos" };
  }

  const token = await getAuthToken();

  const res = await fetch(`${BASE_URL}/packages/${packageId}/confirm`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ code }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      success: false,
      message:
        errBody?.message ?? "Erro ao confirmar retirada. Tente novamente.",
    };
  }

  revalidatePath("/dashboard/packages");
  revalidatePath("/dashboard/packages/confirmar");

  return {
    success: true,
    message: "Retirada confirmada com sucesso!",
  };
}

export async function resendCodeAction(
  prevState: ResendCodeState,
  formData: FormData,
): Promise<ResendCodeState> {
  const packageId = formData.get("packageId") as string;

  if (!packageId) {
    return { success: false, message: "Dados inválidos" };
  }

  const token = await getAuthToken();

  // Chama o endpoint para reenviar o código
  const res = await fetch(`${BASE_URL}/packages/${packageId}/resend-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      success: false,
      message:
        errBody?.message ?? "Erro ao reenviar código. Tente novamente.",
    };
  }

  revalidatePath("/dashboard/packages");

  return {
    success: true,
    message: "Código reenviado com sucesso! Verifique seu e-mail.",
  };
}

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadPhotoAction(
  prevState: UploadPhotoState,
  formData: FormData,
): Promise<UploadPhotoState> {
  const packageId = formData.get("packageId") as string;
  const file = formData.get("photo") as File | null;

  if (!packageId) {
    return { success: false, message: "ID da encomenda não informado." };
  }

  if (!file || file.size === 0) {
    return { success: false, message: "Nenhuma foto selecionada." };
  }

  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return {
      success: false,
      message: "Formato inválido. Use JPG, PNG ou WEBP.",
    };
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return {
      success: false,
      message: "Arquivo muito grande. O tamanho máximo é 5MB.",
    };
  }

  const token = await getAuthToken();

  const body = new FormData();
  body.append("photo", file);

  const res = await fetch(`${BASE_URL}/packages/${packageId}/photo`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      success: false,
      message:
        errBody?.message ?? "Erro ao enviar foto. Tente novamente.",
    };
  }

  revalidatePath("/dashboard/packages");

  return {
    success: true,
    message: "Foto enviada com sucesso!",
  };
}