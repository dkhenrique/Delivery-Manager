import { baseLayout } from './base-layout.template';

interface PackageDeliveredData {
  guardianName: string;
  apartment: string;
  block: string;
  description: string | null;
  deliveredAt: string;
}

export function packageDeliveredTemplate(data: PackageDeliveredData): string {
  const content = `
    <h2>Encomenda retirada com sucesso!</h2>
    <p>Olá, <strong>${data.guardianName}</strong>!</p>

    <div class="success-box">
      ✅ A encomenda que você guardou para o ${data.block} — Apto ${data.apartment} foi retirada com sucesso!
    </div>

    <div class="info-box">
      📝 ${data.description || 'Sem descrição'}<br>
      📅 Retirada em: ${data.deliveredAt}
    </div>

    <p>Obrigado por ajudar seu vizinho!</p>
  `;

  return baseLayout('Encomenda Retirada', content);
}
