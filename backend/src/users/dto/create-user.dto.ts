import { UserRole, UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  name: string;
  email: string;
  password?: string;
  cpf: string;
  role?: UserRole;
  status?: UserStatus;
  apartment_id?: string;
}
