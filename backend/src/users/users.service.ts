import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserStatusDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.apartment_id) {
      await this.checkApartmentLimit(createUserDto.apartment_id);
    }

    const user = this.userRepository.create(createUserDto);

    const plainPassword = createUserDto.password || '123456';
    user.password_hash = await bcrypt.hash(plainPassword, 10);

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findAllPending(): Promise<User[]> {
    return this.userRepository.find({
      where: { status: UserStatus.PENDING },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (
      updateUserDto.apartment_id &&
      updateUserDto.apartment_id !== user.apartment_id
    ) {
      await this.checkApartmentLimit(updateUserDto.apartment_id);
    }

    // Se estiver mudando a role do usuário, precisamos garantir a RN-03
    // Como a role não está no DTO público, isso aqui prepara o terreno caso admin consiga alterar via outro endpoint futuramente.
    const dtoWithRole = updateUserDto as UpdateUserDto & { role?: UserRole };
    if (
      dtoWithRole.role &&
      dtoWithRole.role !== UserRole.ADMIN &&
      user.role === UserRole.ADMIN
    ) {
      await this.checkLastAdmin(user.id);
    }

    // Atualiza apenas campos permitidos pelo DTO (role/status não estão no DTO público)
    Object.assign(user, updateUserDto);

    if (updateUserDto.password) {
      user.password_hash = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userRepository.save(user);
  }

  /**
   * Atualiza status do usuário (operação administrativa).
   * Separado do update público para evitar mass assignment.
   */
  async updateStatus(
    id: string,
    statusDto: UpdateUserStatusDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (
      statusDto.status === UserStatus.REJECTED &&
      user.role === UserRole.ADMIN
    ) {
      await this.checkLastAdmin(user.id);
    }

    if (statusDto.status === UserStatus.APPROVED && user.apartment_id) {
      await this.checkApartmentLimit(user.apartment_id);
    }

    user.status = statusDto.status;
    if (statusDto.rejection_reason !== undefined) {
      user.rejection_reason = statusDto.rejection_reason;
    }

    const updatedUser = await this.userRepository.save(user);

    // RN-20: Notifica o morador sobre a decisão
    if (updatedUser.status === UserStatus.APPROVED) {
      void this.notificationsService.notifyUserApproved(updatedUser);
    } else if (updatedUser.status === UserStatus.REJECTED) {
      void this.notificationsService.notifyUserRejected(updatedUser);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (user.role === UserRole.ADMIN) {
      await this.checkLastAdmin(user.id);
    }
    await this.userRepository.remove(user);
  }

  private async checkLastAdmin(userIdToChange: string): Promise<void> {
    const adminCount = await this.userRepository.count({
      where: { role: UserRole.ADMIN, status: UserStatus.APPROVED },
    });

    const isThisUserApprovedAdmin = await this.userRepository.findOne({
      where: {
        id: userIdToChange,
        role: UserRole.ADMIN,
        status: UserStatus.APPROVED,
      },
    });

    if (adminCount <= 1 && isThisUserApprovedAdmin) {
      throw new BadRequestException(
        'Ação bloqueada (RN-03): O sistema necessita de pelo menos um Administrador aprovado ativo.',
      );
    }
  }

  private async checkApartmentLimit(apartmentId: string): Promise<void> {
    const residentCount = await this.userRepository.count({
      where: { apartment_id: apartmentId, status: UserStatus.APPROVED },
    });

    if (residentCount >= 2) {
      throw new BadRequestException(
        'Ação bloqueada (RN-08): Este apartamento já possui o limite máximo de 2 moradores aprovados.',
      );
    }
  }
}
