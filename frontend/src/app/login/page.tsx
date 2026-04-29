import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-muted/30">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Delivery Manager</h1>
          <p className="text-sm text-muted-foreground">
            Acesso administrativo e rastreio de encomendas para condomínios.
          </p>
        </div>

        <LoginForm />

        <div className="flex flex-col items-center gap-2 text-sm">
          <Link href="/cadastro" className="text-primary hover:underline font-medium">
            Não tem conta? Cadastre-se
          </Link>
          <Link href="/esqueci-senha" className="text-muted-foreground hover:underline">
            Esqueceu sua senha?
          </Link>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Desenvolvido via Arquitetura Limpa
        </div>
      </div>
    </main>
  );
}
