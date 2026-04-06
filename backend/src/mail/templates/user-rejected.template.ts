import { baseLayout } from './base-layout.template';

interface UserRejectedData {
  userName: string;
  reason: string;
}

export function userRejectedTemplate(data: UserRejectedData): string {
  const content = `
    <h2>Cadastro não aprovado</h2>
    <p>Olá, <strong>${data.userName}</strong>.</p>

    <div class="alert-box">
      ❌ Infelizmente seu cadastro no DeliveryManager <strong>não foi aprovado</strong>.
    </div>

    <div class="info-box">
      <strong>Motivo:</strong><br>
      ${data.reason}
    </div>

    <p>Se acredita que houve um erro, entre em contato com a administração do seu condomínio.</p>
  `;

  return baseLayout('Cadastro Não Aprovado', content);
}
