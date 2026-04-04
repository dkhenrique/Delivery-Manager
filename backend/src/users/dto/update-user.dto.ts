import { UserRole, UserStatus } from '../entities/user.entity';

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  role?: UserRole;
  status?: UserStatus;
  apartment_id?: string;
  rejection_reason?: string;
}
