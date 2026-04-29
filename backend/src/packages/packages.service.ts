import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package, PackageStatus } from './entities/package.entity';
import { PickupCode } from './entities/pickup-code.entity';
import { Apartment } from '../condominiums/entities/apartment.entity';
import { User } from '../users/entities/user.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(PickupCode)
    private readonly pickupCodeRepository: Repository<PickupCode>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Registra uma nova encomenda e gera o código de retirada.
   * RN-11: Só moradores APPROVED (verificado pelo guard).
   * RN-12: Apartment deve existir.
   * RN-14: Prazo de guarda calculado a partir de agora.
   * RN-16: Código de 6 dígitos único entre ativos.
   */
  async create(
    dto: CreatePackageDto,
    receivedByUserId: string,
  ): Promise<Package> {
    // RN-12: Valida que o apartamento destinatário existe
    const apartment = await this.apartmentRepository.findOne({
      where: { id: dto.recipient_apartment_id },
    });
    if (!apartment) {
      throw new BadRequestException(
        'Apartamento não encontrado. Verifique o bloco e número ou entre em contato com o síndico.',
      );
    }

    // RN-14: Calcula prazo de guarda
    const storageDeadline = new Date();
    storageDeadline.setDate(
      storageDeadline.getDate() + dto.storage_deadline_days,
    );

    const pkg = this.packageRepository.create({
      received_by_user_id: receivedByUserId,
      recipient_apartment_id: dto.recipient_apartment_id,
      description: dto.description || null,
      photo_url: null,
      status: PackageStatus.WAITING_PICKUP,
      storage_deadline: storageDeadline,
    });

    const savedPackage = await this.packageRepository.save(pkg);

    // RN-16: Gera código de retirada único
    await this.createPickupCode(savedPackage.id);

    // Retorna com o pickup_code populado
    const fullPackage = await this.findOne(savedPackage.id);

    // RN-20: Notifica moradores do apartamento destinatário
    void this.notificationsService.notifyPackageRegistered(fullPackage);

    return fullPackage;
  }

  /** Admin: lista todas as encomendas com relations */
  async findAll(): Promise<Package[]> {
    return this.packageRepository.find({
      relations: [
        'received_by_user',
        'recipient_apartment',
        'recipient_apartment.block',
        'pickup_code',
      ],
      order: { created_at: 'DESC' },
    });
  }

  /** Encomendas destinadas ao apartamento do usuário */
  async findMyPackages(userId: string): Promise<Package[]> {
    // apartment_id is not in the JWT payload, so we look it up from the DB
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user?.apartment_id) return [];

    return this.packageRepository.find({
      where: { recipient_apartment_id: user.apartment_id },
      relations: ['received_by_user', 'recipient_apartment', 'pickup_code'],
      order: { created_at: 'DESC' },
    });
  }

  /** Encomendas que o usuário está guardando */
  async findGuardedByMe(userId: string): Promise<Package[]> {
    return this.packageRepository.find({
      where: { received_by_user_id: userId },
      relations: ['recipient_apartment', 'recipient_apartment.block'],
      order: { created_at: 'DESC' },
    });
  }

  /** Busca uma encomenda por ID com todas as relations */
  async findOne(id: string): Promise<Package> {
    const pkg = await this.packageRepository.findOne({
      where: { id },
      relations: [
        'received_by_user',
        'recipient_apartment',
        'recipient_apartment.block',
        'pickup_code',
      ],
    });

    if (!pkg) {
      throw new NotFoundException(`Encomenda com ID ${id} não encontrada`);
    }

    return pkg;
  }

  /**
   * Confirma a retirada de uma encomenda via código.
   * RN-19: Valida existência, expiração e status.
   * Mensagem genérica para não distinguir motivo do erro.
   */
  async confirmPickup(packageId: string, code: string): Promise<Package> {
    const pkg = await this.findOne(packageId);

    // RN-19: Encomendas já entregues não aceitam código
    if (pkg.status === PackageStatus.DELIVERED) {
      throw new BadRequestException('Esta encomenda já foi retirada');
    }

    // RN-13: Só WAITING_PICKUP e OVERDUE podem ser confirmadas
    if (
      pkg.status !== PackageStatus.WAITING_PICKUP &&
      pkg.status !== PackageStatus.OVERDUE
    ) {
      throw new BadRequestException('Código de retirada inválido');
    }

    if (!pkg.pickup_code) {
      throw new BadRequestException('Código de retirada inválido');
    }

    // RN-19: Mensagem genérica — não distingue "inválido" vs "expirado"
    const isCodeValid = pkg.pickup_code.code === code;
    const isExpired = new Date() > new Date(pkg.pickup_code.expires_at);

    if (!isCodeValid || isExpired) {
      throw new BadRequestException('Código de retirada inválido');
    }

    // RN-13: Transição → DELIVERED
    pkg.status = PackageStatus.DELIVERED;
    pkg.delivered_at = new Date();

    const delivered = await this.packageRepository.save(pkg);

    // RN-20: Notifica morador que guardou sobre a retirada
    void this.notificationsService.notifyPackageDelivered(delivered);

    return delivered;
  }

  /**
   * Reenvia ou regenera o código de retirada.
   * RN-18: Se válido → reenvia o mesmo. Se expirado → gera novo.
   */
  async resendCode(packageId: string): Promise<PickupCode> {
    const pkg = await this.findOne(packageId);

    if (pkg.status === PackageStatus.DELIVERED) {
      throw new BadRequestException(
        'Não é possível reenviar código de encomenda já retirada',
      );
    }

    if (!pkg.pickup_code) {
      // Caso edge: código foi deletado — regenera
      return this.createPickupCode(packageId);
    }

    const isExpired = new Date() > new Date(pkg.pickup_code.expires_at);

    if (isExpired) {
      // RN-18: Código expirado → gera novo código e nova expiração
      const newCode = await this.generateUniqueCode();
      const newExpiration = new Date();
      newExpiration.setHours(newExpiration.getHours() + 24);

      pkg.pickup_code.code = newCode;
      pkg.pickup_code.expires_at = newExpiration;

      const saved = await this.pickupCodeRepository.save(pkg.pickup_code);

      // RN-20: Notifica com novo código
      void this.notificationsService.notifyCodeResent(pkg, saved);

      return saved;
    }

    // RN-18: Código ainda válido → reenvia por email
    void this.notificationsService.notifyCodeResent(pkg, pkg.pickup_code);
    return pkg.pickup_code;
  }

  /**
   * Upload de foto para uma encomenda existente.
   * RN-15: Máx 5MB, JPG/PNG/WEBP.
   */
  async uploadPhoto(packageId: string, photoPath: string): Promise<Package> {
    const pkg = await this.findOne(packageId);
    pkg.photo_url = photoPath;
    return this.packageRepository.save(pkg);
  }

  // ── Helpers privados ──────────────────────────────────────

  /** Cria um PickupCode vinculado a uma encomenda */
  private async createPickupCode(packageId: string): Promise<PickupCode> {
    const code = await this.generateUniqueCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // RN-17: 24h de validade

    const pickupCode = this.pickupCodeRepository.create({
      package_id: packageId,
      code,
      expires_at: expiresAt,
    });

    return this.pickupCodeRepository.save(pickupCode);
  }

  /**
   * Gera um código de 6 dígitos numérico único entre códigos ativos.
   * RN-16: Não reutiliza códigos enquanto houver outros ativos.
   */
  private async generateUniqueCode(): Promise<string> {
    const maxAttempts = 20;

    for (let i = 0; i < maxAttempts; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Verifica se o código já está em uso por uma encomenda ativa
      const existing = await this.pickupCodeRepository
        .createQueryBuilder('pc')
        .innerJoin('pc.package', 'pkg')
        .where('pc.code = :code', { code })
        .andWhere('pkg.status IN (:...statuses)', {
          statuses: [PackageStatus.WAITING_PICKUP, PackageStatus.OVERDUE],
        })
        .andWhere('pc.expires_at > :now', { now: new Date() })
        .getOne();

      if (!existing) {
        return code;
      }
    }

    throw new BadRequestException(
      'Não foi possível gerar um código único. Tente novamente.',
    );
  }
}
