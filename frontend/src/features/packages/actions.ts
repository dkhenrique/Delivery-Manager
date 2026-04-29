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
