import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { Package, PackageStatus } from '../packages/entities/package.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  async getMetrics() {
    const pendingResidents = await this.userRepository.count({
      where: { status: UserStatus.PENDING },
    });

    const awaitingPickupPackages = await this.packageRepository.count({
      where: { status: PackageStatus.WAITING_PICKUP },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const receivedTodayPackages = await this.packageRepository
      .createQueryBuilder('p')
      .where('p.created_at >= :today', { today })
      .getCount();

    return {
      pendingResidents,
      awaitingPickupPackages,
      receivedTodayPackages,
    };
  }
}
