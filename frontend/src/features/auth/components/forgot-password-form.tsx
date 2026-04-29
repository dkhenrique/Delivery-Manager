"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { forgotPasswordAction } from "../actions";
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
      {pending ? "Enviando..." : "Enviar link de recuperação"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, {
    success: false,
  });

  if (state.success) {
    return (
      <Card className="w-full max-w-sm mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">E-mail enviado</CardTitle>
          <CardDescription>Verifique sua caixa de entrada.</CardDescription>
        </CardHeader>
        <CardContent className="pb-6 space-y-4 text-center">
          <p className="text-sm text-green-600 font-medium">{state.message}</p>
          <Link
            href="/login"
            className="inline-block text-sm text-primary hover:underline font-medium"
          >
            Voltar ao login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full max-w-sm mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Recuperar senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para receber o link de redefinição.
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
                placeholder="seu@email.com"
                required
              />
            </div>

            {!state.success && state.message && (
              <p className="text-sm text-destructive text-center font-medium">
                {state.message}
              </p>
            )}

            <div className="pt-2">
              <SubmitButton />
            </div>
          </CardContent>
        </form>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
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
