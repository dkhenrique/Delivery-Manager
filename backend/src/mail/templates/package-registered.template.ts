import { baseLayout } from './base-layout.template';

interface PackageRegisteredData {
  recipientName: string;
  description: string | null;
  apartment: string;
  block: string;
  code: string;
  expiresAt: string;
  storageDeadline: string;
  guardianName: string;
}

export function packageRegisteredTemplate(data: PackageRegisteredData): string {
  const content = `
    <h2>Nova encomenda registrada!</h2>
    <p>Olá, <strong>${data.recipientName}</strong>!</p>
    <p>Uma encomenda foi registrada para o seu apartamento.</p>

    <div class="info-box">
      <strong>Detalhes:</strong><br>
      📍 ${data.block} — Apto ${data.apartment}<br>
      📝 ${data.description || 'Sem descrição'}<br>
      👤 Recebida por: ${data.guardianName}<br>
      📅 Prazo de guarda: ${data.storageDeadline}
    </div>

    <p>Use o código abaixo para confirmar a retirada:</p>
    <div style="text-align: center;">
      <div class="code-box">${data.code}</div>
    </div>
    <p style="font-size: 13px; color: #6b7280;">
      ⏰ Este código expira em: <strong>${data.expiresAt}</strong>
    </p>
  `;

  return baseLayout('Nova Encomenda Registrada', content);
}
