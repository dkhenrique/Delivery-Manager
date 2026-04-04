import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserStatusDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
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

    user.status = statusDto.status;
    if (statusDto.rejection_reason !== undefined) {
      user.rejection_reason = statusDto.rejection_reason;
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
