import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24 bg-muted/30">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Delivery Manager</h1>
          <p className="text-sm text-muted-foreground">
            Enviaremos um link de redefinição para seu e-mail.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Desenvolvido via Arquitetura Limpa
        </div>
      </div>
    </main>
  );
}
