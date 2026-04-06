import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, IsNull, Repository, In } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Package, PackageStatus } from '../packages/entities/package.entity';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { PickupCode } from '../packages/entities/pickup-code.entity';
import { packageRegisteredTemplate } from '../mail/templates/package-registered.template';
import { pickupCodeResentTemplate } from '../mail/templates/pickup-code-resent.template';
import { packageDeliveredTemplate } from '../mail/templates/package-delivered.template';
import { userApprovedTemplate } from '../mail/templates/user-approved.template';
import { userRejectedTemplate } from '../mail/templates/user-rejected.template';
import { pendingRegistrationAlertTemplate } from '../mail/templates/pending-registration-alert.template';
import { overduePackageAlertTemplate } from '../mail/templates/overdue-package-alert.template';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  /**
   * RN-20: Encomenda registrada → e-mail para moradores do apartamento destinatário.
   */
  async notifyPackageRegistered(pkg: Package): Promise<void> {
    const recipients = await this.getApartmentResidents(
      pkg.recipient_apartment_id,
    );
    if (recipients.length === 0) return;

    const apartment = pkg.recipient_apartment;
    const pickupCode = pkg.pickup_code;

    const html = packageRegisteredTemplate({
      recipientName: recipients.map((u) => u.name).join(', '),
      description: pkg.description,
      apartment: apartment?.number || 'N/A',
      block: apartment?.block?.name || 'N/A',
      code: pickupCode?.code || 'N/A',
      expiresAt: this.formatDate(pickupCode?.expires_at),
      storageDeadline: this.formatDate(pkg.storage_deadline),
      guardianName: pkg.received_by_user?.name || 'N/A',
    });

    const emails = recipients.map((u) => u.email);
    await this.mailService.sendMail(
      emails,
      '📦 Nova encomenda registrada para seu apartamento',
      html,
    );
  }

  /**
   * RN-20: Código reenviado → e-mail para moradores do apartamento.
   */
  async notifyCodeResent(pkg: Package, pickupCode: PickupCode): Promise<void> {
    const recipients = await this.getApartmentResidents(
      pkg.recipient_apartment_id,
    );
    if (recipients.length === 0) return;

    const apartment = pkg.recipient_apartment;

    const html = pickupCodeResentTemplate({
      recipientName: recipients.map((u) => u.name).join(', '),
      apartment: apartment?.number || 'N/A',
      block: apartment?.block?.name || 'N/A',
      code: pickupCode.code,
      expiresAt: this.formatDate(pickupCode.expires_at),
    });

    const emails = recipients.map((u) => u.email);
    await this.mailService.sendMail(
      emails,
      '🔑 Código de retirada reenviado',
      html,
    );
  }

  /**
   * RN-20: Encomenda retirada → e-mail para morador que guardou.
   */
  async notifyPackageDelivered(pkg: Package): Promise<void> {
    const guardian = pkg.received_by_user;
    if (!guardian) return;

    const apartment = pkg.recipient_apartment;

    const html = packageDeliveredTemplate({
      guardianName: guardian.name,
      apartment: apartment?.number || 'N/A',
      block: apartment?.block?.name || 'N/A',
      description: pkg.description,
      deliveredAt: this.formatDate(pkg.delivered_at),
    });

    await this.mailService.sendMail(
      guardian.email,
      '✅ Encomenda que você guardou foi retirada',
      html,
    );
  }

  /**
   * RN-20: Cadastro aprovado → e-mail para o morador.
   */
  async notifyUserApproved(user: User): Promise<void> {
    const html = userApprovedTemplate({ userName: user.name });
    await this.mailService.sendMail(
      user.email,
      '✅ Seu cadastro foi aprovado!',
      html,
    );
  }

  /**
   * RN-20: Cadastro rejeitado → e-mail para o morador.
   */
  async notifyUserRejected(user: User): Promise<void> {
    const html = userRejectedTemplate({
      userName: user.name,
      reason: user.rejection_reason || 'Motivo não informado',
    });
    await this.mailService.sendMail(
      user.email,
      '⚠️ Seu cadastro não foi aprovado',
      html,
    );
  }

  /**
   * RN-20 + RN-21: Cadastros pendentes há mais de 48h → alerta para admins.
   * Idempotência: marca pending_alert_sent_at após envio.
   */
  async checkPendingRegistrations(): Promise<void> {
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 48);

    const pendingUsers = await this.userRepository.find({
      where: {
        status: UserStatus.PENDING,
        created_at: LessThan(threshold),
        pending_alert_sent_at: IsNull(),
      },
    });

    if (pendingUsers.length === 0) return;

    // Busca admins
    const admins = await this.userRepository.find({
      where: { role: UserRole.ADMIN, status: UserStatus.APPROVED },
    });

    if (admins.length === 0) {
      this.logger.warn(
        'Nenhum admin encontrado para enviar alerta de cadastros pendentes',
      );
      return;
    }

    const html = pendingRegistrationAlertTemplate({
      pendingUsers: pendingUsers.map((u) => ({
        name: u.name,
        email: u.email,
        createdAt: this.formatDate(u.created_at),
      })),
    });

    const adminEmails = admins.map((a) => a.email);
    await this.mailService.sendMail(
      adminEmails,
      `⚠️ ${pendingUsers.length} cadastro(s) pendente(s) há mais de 48h`,
      html,
    );

    // RN-21: Marca como alertado
    const ids = pendingUsers.map((u) => u.id);
    await this.userRepository.update(
      { id: In(ids) },
      { pending_alert_sent_at: new Date() },
    );

    this.logger.log(
      `Alerta de ${pendingUsers.length} cadastros pendentes enviado para ${adminEmails.length} admin(s)`,
    );
  }

  /**
   * RN-20 + RN-21: Encomendas com prazo vencido → marca OVERDUE + alerta.
   * Idempotência: usa overdue_alert_sent_at.
   */
  async checkOverduePackages(): Promise<void> {
    const now = new Date();

    const overduePackages = await this.packageRepository.find({
      where: {
        status: PackageStatus.WAITING_PICKUP,
        storage_deadline: LessThan(now),
        overdue_alert_sent_at: IsNull(),
      },
      relations: [
        'received_by_user',
        'recipient_apartment',
        'recipient_apartment.block',
      ],
    });

    if (overduePackages.length === 0) return;

    // Atualiza status para OVERDUE
    for (const pkg of overduePackages) {
      pkg.status = PackageStatus.OVERDUE;
      pkg.overdue_alert_sent_at = new Date();
      await this.packageRepository.save(pkg);
    }

    // Notifica moradores dos apartamentos destinatários
    for (const pkg of overduePackages) {
      const residents = await this.getApartmentResidents(
        pkg.recipient_apartment_id,
      );
      if (residents.length > 0) {
        const html = overduePackageAlertTemplate({
          packages: [
            {
              description: pkg.description,
              apartment: pkg.recipient_apartment?.number || 'N/A',
              block: pkg.recipient_apartment?.block?.name || 'N/A',
              storageDeadline: this.formatDate(pkg.storage_deadline),
              guardianName: pkg.received_by_user?.name || 'N/A',
            },
          ],
        });
        const emails = residents.map((r) => r.email);
        await this.mailService.sendMail(
          emails,
          '🚨 Encomenda com prazo de guarda vencido',
          html,
        );
      }
    }

    // Notifica admins com resumo consolidado
    const admins = await this.userRepository.find({
      where: { role: UserRole.ADMIN, status: UserStatus.APPROVED },
    });

    if (admins.length > 0) {
      const html = overduePackageAlertTemplate({
        packages: overduePackages.map((p) => ({
          description: p.description,
          apartment: p.recipient_apartment?.number || 'N/A',
          block: p.recipient_apartment?.block?.name || 'N/A',
          storageDeadline: this.formatDate(p.storage_deadline),
          guardianName: p.received_by_user?.name || 'N/A',
        })),
      });
      await this.mailService.sendMail(
        admins.map((a) => a.email),
        `🚨 ${overduePackages.length} encomenda(s) com prazo vencido`,
        html,
      );
    }

    this.logger.log(
      `${overduePackages.length} encomenda(s) marcadas como OVERDUE e alertas enviados`,
    );
  }

  // ── Helpers ─────────────────────────────

  /** Busca moradores aprovados de um apartamento */
  private async getApartmentResidents(apartmentId: string): Promise<User[]> {
    return this.userRepository.find({
      where: {
        apartment_id: apartmentId,
        status: UserStatus.APPROVED,
      },
    });
  }

  /** Formata Date para string legível */
  private formatDate(date: Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
