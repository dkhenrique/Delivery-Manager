"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending || disabled}>
      {pending ? "Cadastrando..." : "Criar conta"}
    </Button>
  );
}

const initialState: RegisterState = { success: false };

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full max-w-sm mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para solicitar seu acesso.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4 pb-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="João da Silva"
                required
                aria-describedby={
                  state?.errors?.name ? "name-error" : undefined
                }
              />
              {state?.errors?.name && (
                <p
                  id="name-error"
                  className="text-sm text-destructive font-medium"
                >
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="joao@email.com"
                required
                aria-describedby={
                  state?.errors?.email ? "email-error" : undefined
                }
              />
              {state?.errors?.email && (
                <p
                  id="email-error"
                  className="text-sm text-destructive font-medium"
                >
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                required
                aria-describedby={state?.errors?.cpf ? "cpf-error" : undefined}
              />
              {state?.errors?.cpf && (
                <p
                  id="cpf-error"
                  className="text-sm text-destructive font-medium"
                >
                  {state.errors.cpf[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                aria-describedby={
                  state?.errors?.password ? "password-error" : undefined
                }
              />
              {state?.errors?.password && (
                <p
                  id="password-error"
                  className="text-sm text-destructive font-medium"
                >
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                aria-describedby={
                  state?.errors?.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
              />
              {state?.errors?.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="text-sm text-destructive font-medium"
                >
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            {/* Global error message */}
            {!state?.success && state?.message && (
              <p className="text-sm text-destructive text-center font-medium">
                {state.message}
              </p>
            )}

            {/* Success message */}
            {state?.success && state?.message && (
              <p className="text-sm text-green-600 text-center font-medium">
                {state.message}
              </p>
            )}

            <div className="pt-2">
              <SubmitButton disabled={state?.success} />
            </div>
          </CardContent>
        </form>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline font-medium"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
