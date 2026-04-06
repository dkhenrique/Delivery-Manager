import { baseLayout } from './base-layout.template';

interface PendingRegistrationData {
  pendingUsers: Array<{
    name: string;
    email: string;
    createdAt: string;
  }>;
}

export function pendingRegistrationAlertTemplate(
  data: PendingRegistrationData,
): string {
  const rows = data.pendingUsers
    .map(
      (u) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${u.name}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${u.email}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${u.createdAt}</td>
      </tr>`,
    )
    .join('');

  const content = `
    <h2>⚠️ Cadastros pendentes há mais de 48h</h2>
    <p>Os seguintes moradores estão aguardando aprovação há mais de 48 horas:</p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 8px 12px; text-align: left;">Nome</th>
          <th style="padding: 8px 12px; text-align: left;">E-mail</th>
          <th style="padding: 8px 12px; text-align: left;">Cadastro em</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <p>Acesse o sistema para aprovar ou rejeitar esses cadastros.</p>
  `;

  return baseLayout('Cadastros Pendentes', content);
}
