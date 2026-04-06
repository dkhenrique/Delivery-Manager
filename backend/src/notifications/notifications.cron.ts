import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsCron {
  private readonly logger = new Logger(NotificationsCron.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Roda a cada hora.
   * Verifica cadastros pendentes há mais de 48h (RN-20 + RN-21).
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handlePendingRegistrations(): Promise<void> {
    this.logger.debug('Verificando cadastros pendentes...');
    await this.notificationsService.checkPendingRegistrations();
  }

  /**
   * Roda a cada hora.
   * Verifica encomendas com prazo de guarda vencido (RN-20 + RN-21).
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverduePackages(): Promise<void> {
    this.logger.debug('Verificando encomendas com prazo vencido...');
    await this.notificationsService.checkOverduePackages();
  }
}
