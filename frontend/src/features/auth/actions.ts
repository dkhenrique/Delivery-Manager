"use server";

import { redirect } from "next/navigation";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./schemas";
import api from "@/services/api";

export type LoginState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function loginAction(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campos inválidos. Verifique os dados fornecidos.",
    };
  }

  try {
    const response = await api.post("/auth/login", validatedFields.data);

    const { access_token } = response.data;

    if (!access_token) {
      return {
        success: false,
        message: "Token não recebido do servidor. Tente novamente.",
      };
    }

    const { cookies } = await import("next/headers");
    (await cookies()).set("jwt", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const errorMsg =
      axiosError.response?.data?.message ||
      "Erro ao realizar login. Verifique suas credenciais.";
    return {
      success: false,
      message: errorMsg,
    };
  }

  // IMPORTANT: redirect must be called OUTSIDE try/catch.
  // It throws a special NEXT_REDIRECT error that would be swallowed by catch.
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const { cookies } = await import("next/headers");
  (await cookies()).delete("jwt");
  redirect("/login");
}

// ─── Register ─────────────────────────────────────────────────────────────────

export type RegisterState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function registerAction(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    cpf: formData.get("cpf") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = registerSchema.safeParse(raw);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Verifique os campos e tente novamente.",
    };
  }

  const payload = {
    name: validated.data.name,
    email: validated.data.email,
    cpf: validated.data.cpf,
    password: validated.data.password,
  };

  try {
    await api.post("/auth/register", payload);
    return {
      success: true,
      message: "Cadastro realizado! Aguarde a aprovação do administrador.",
    };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message:
        axiosError.response?.data?.message ?? "Erro ao realizar cadastro.",
    };
  }
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export type ForgotPasswordState = {
  success: boolean;
  message?: string;
};

export async function forgotPasswordAction(
  prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = formData.get("email") as string;
  const validated = forgotPasswordSchema.safeParse({ email });

  if (!validated.success) {
    return {
      success: false,
      message: "Digite um e-mail válido.",
    };
  }

  try {
    await api.post("/auth/forgot-password", { email: validated.data.email });
    return {
      success: true,
      message:
        "Se o e-mail existir no sistema, você receberá um link de recuperação em breve.",
    };
  } catch {
    // Always show success to prevent email enumeration
    return {
      success: true,
      message:
        "Se o e-mail existir no sistema, você receberá um link de recuperação em breve.",
    };
  }
}

// ─── Reset password ───────────────────────────────────────────────────────────

export type ResetPasswordState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function resetPasswordAction(
  prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = formData.get("token") as string;
  const raw = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validated = resetPasswordSchema.safeParse(raw);
  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Verifique os campos e tente novamente.",
    };
  }

  try {
    await api.post("/auth/reset-password", {
      token,
      password: validated.data.password,
    });
    return {
      success: true,
      message: "Senha redefinida com sucesso! Você já pode fazer login.",
    };
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message:
        axiosError.response?.data?.message ?? "Token inválido ou expirado.",
    };
  }
}
