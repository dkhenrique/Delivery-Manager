import { baseLayout } from './base-layout.template';

interface CodeResentData {
  recipientName: string;
  apartment: string;
  block: string;
  code: string;
  expiresAt: string;
}

export function pickupCodeResentTemplate(data: CodeResentData): string {
  const content = `
    <h2>Código de retirada reenviado</h2>
    <p>Olá, <strong>${data.recipientName}</strong>!</p>
    <p>Seu código de retirada para a encomenda do ${data.block} — Apto ${data.apartment} foi reenviado.</p>

    <div style="text-align: center;">
      <div class="code-box">${data.code}</div>
    </div>
    <p style="font-size: 13px; color: #6b7280;">
      ⏰ Este código expira em: <strong>${data.expiresAt}</strong>
    </p>
  `;

  return baseLayout('Código de Retirada Reenviado', content);
}
