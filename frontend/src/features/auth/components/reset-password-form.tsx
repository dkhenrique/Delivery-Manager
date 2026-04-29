"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { resetPasswordAction, ResetPasswordState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending || disabled}>
      {pending ? "Redefinindo..." : "Redefinir senha"}
    </Button>
  );
}

const initialState: ResetPasswordState = { success: false };

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="w-full max-w-sm mx-auto shadow-sm">
          <CardContent className="pt-6 pb-6 space-y-4 text-center">
            <p className="text-destructive font-medium">
              Link inválido. Solicite um novo link de recuperação.
            </p>
            <Link
              href="/esqueci-senha"
              className="inline-block text-primary hover:underline font-medium text-sm"
            >
              Solicitar novo link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="w-full max-w-sm mx-auto shadow-sm">
          <CardContent className="pt-6 pb-6 space-y-4 text-center">
            <p className="text-green-600 font-medium">{state.message}</p>
            <Link
              href="/login"
              className="inline-block text-primary hover:underline font-medium text-sm"
            >
              Senha redefinida! Clique aqui para fazer login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full max-w-sm mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Redefinir senha</CardTitle>
          <CardDescription>
            Escolha uma nova senha para sua conta.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4 pb-6">
            <input type="hidden" name="token" value={token} />

            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
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

      <div className="text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:underline">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
