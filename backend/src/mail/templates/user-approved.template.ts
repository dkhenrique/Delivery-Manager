import { baseLayout } from './base-layout.template';

interface UserApprovedData {
  userName: string;
}

export function userApprovedTemplate(data: UserApprovedData): string {
  const content = `
    <h2>Cadastro aprovado!</h2>
    <p>Olá, <strong>${data.userName}</strong>!</p>

    <div class="success-box">
      ✅ Seu cadastro no DeliveryManager foi <strong>aprovado</strong> pelo síndico!
    </div>

    <p>Agora você pode:</p>
    <ul>
      <li>Registrar encomendas que receber para seus vizinhos</li>
      <li>Acompanhar encomendas destinadas ao seu apartamento</li>
      <li>Confirmar retiradas com o código de segurança</li>
    </ul>

    <p>Acesse o sistema e aproveite!</p>
  `;

  return baseLayout('Cadastro Aprovado', content);
}
