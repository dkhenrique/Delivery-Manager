import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST');

    if (host) {
      // Produção: usa SMTP configurado
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('SMTP_PORT', 587),
        secure: this.configService.get<number>('SMTP_PORT', 587) === 465,
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
      this.logger.log(`SMTP configurado: ${host}`);
    } else {
      // Dev: cria conta Ethereal automaticamente
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.warn(
        `SMTP não configurado — usando Ethereal (e-mails não são enviados de verdade)`,
      );
      this.logger.log(`Ethereal user: ${testAccount.user}`);
    }
  }

  /**
   * Envia um e-mail.
   * Em dev (Ethereal), loga a URL de preview no console.
   */
  async sendMail(
    to: string | string[],
    subject: string,
    html: string,
  ): Promise<void> {
    const from =
      this.configService.get<string>('SMTP_FROM') ||
      'DeliveryManager <noreply@deliverymanager.com>';

    const recipients = Array.isArray(to) ? to.join(', ') : to;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info: nodemailer.SentMessageInfo = await this.transporter.sendMail({
        from,
        to: recipients,
        subject,
        html,
      });

      this.logger.log(`E-mail enviado para ${recipients}: ${subject}`);

      // Se Ethereal, mostra URL de preview
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`📧 Preview: ${String(previewUrl)}`);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.logger.error(
        `Falha ao enviar e-mail para ${recipients}: ${message}`,
      );
      // Não lança exceção — falha de e-mail não deve bloquear fluxo principal
    }
  }
}
