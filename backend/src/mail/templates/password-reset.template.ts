import { baseLayout } from './base-layout.template';

interface PasswordResetData {
  userName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function passwordResetTemplate(data: PasswordResetData): string {
  const content = `
    <h2>Recuperação de senha</h2>
    <p>Olá, <strong>${data.userName}</strong>!</p>

    <p>Recebemos uma solicitação para redefinir a senha da sua conta no DeliveryManager.</p>

    <div class="info-box">
      🔑 Clique no botão abaixo para criar uma nova senha. Este link é válido por <strong>${data.expiresInMinutes} minutos</strong>.
    </div>

    <p style="text-align: center; margin: 28px 0;">
      <a href="${data.resetUrl}"
         style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none;
                font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px;">
        Redefinir minha senha
      </a>
    </p>

    <p>Ou copie e cole o link abaixo no seu navegador:</p>
    <p style="word-break: break-all; font-size: 13px; color: #4b5563;">${data.resetUrl}</p>

    <div class="alert-box">
      ⚠️ Se você não solicitou a recuperação de senha, ignore este e-mail. Sua senha permanecerá a mesma e nenhuma alteração será feita.
    </div>
  `;

  return baseLayout('Recuperação de Senha', content);
}
