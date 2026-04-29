import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Digite um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Nome deve ter ao menos 3 caracteres." }),
    email: z.string().email({ message: "Digite um e-mail válido." }),
    cpf: z
      .string()
      .min(11, { message: "CPF deve ter 11 dígitos." })
      .max(14, { message: "CPF inválido." })
      .transform((v) => v.replace(/\D/g, "")), // strip formatting
    password: z
      .string()
      .min(6, { message: "Senha deve ter ao menos 6 caracteres." }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha." }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Digite um e-mail válido." }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Senha deve ter ao menos 6 caracteres." }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha." }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
