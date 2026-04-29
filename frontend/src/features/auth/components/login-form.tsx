"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "../actions";
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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, { success: false });

  return (
    <Card className="w-full max-w-sm mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Delivery Manager</CardTitle>
        <CardDescription>
          Insira suas credenciais para acessar o painel
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@condominium.com"
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

          {!state?.success && state?.message && (
            <p className="text-sm text-destructive text-center font-medium">
              {state.message}
            </p>
          )}

          {state?.success && (
            <p className="text-sm text-primary text-center font-medium">
              {state.message} Redirecionando...
            </p>
          )}

          <div className="pt-2">
            <SubmitButton />
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
