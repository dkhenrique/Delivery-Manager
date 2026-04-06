/**
 * Layout base reutilizável para todos os e-mails.
 * Garante visual consistente e profissional.
 */
export function baseLayout(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 560px; margin: 32px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px 32px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; }
    .body { padding: 32px; color: #1f2937; line-height: 1.6; }
    .body h2 { margin: 0 0 16px; font-size: 18px; color: #111827; }
    .body p { margin: 0 0 12px; font-size: 15px; }
    .code-box { display: inline-block; background: #eff6ff; border: 2px dashed #2563eb; border-radius: 8px; padding: 12px 24px; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1e40af; margin: 16px 0; }
    .info-box { background: #f9fafb; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; }
    .alert-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; color: #991b1b; }
    .success-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 14px; color: #166534; }
    .footer { padding: 16px 32px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 DeliveryManager</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      Este é um e-mail automático do sistema DeliveryManager.<br>
      Por favor, não responda a este e-mail.
    </div>
  </div>
</body>
</html>`;
}
