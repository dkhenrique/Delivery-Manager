import { baseLayout } from './base-layout.template';

interface OverduePackageData {
  packages: Array<{
    description: string | null;
    apartment: string;
    block: string;
    storageDeadline: string;
    guardianName: string;
  }>;
}

export function overduePackageAlertTemplate(data: OverduePackageData): string {
  const rows = data.packages
    .map(
      (p) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${p.block} — ${p.apartment}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${p.description || 'Sem descrição'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${p.guardianName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">${p.storageDeadline}</td>
      </tr>`,
    )
    .join('');

  const content = `
    <h2>🚨 Encomendas com prazo vencido</h2>
    <p>As seguintes encomendas ultrapassaram o prazo de guarda:</p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
      <thead>
        <tr style="background: #fef2f2;">
          <th style="padding: 8px 12px; text-align: left;">Destino</th>
          <th style="padding: 8px 12px; text-align: left;">Descrição</th>
          <th style="padding: 8px 12px; text-align: left;">Guardião</th>
          <th style="padding: 8px 12px; text-align: left;">Venceu em</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <p>Entre em contato com os moradores para resolver a situação.</p>
  `;

  return baseLayout('Encomendas com Prazo Vencido', content);
}
