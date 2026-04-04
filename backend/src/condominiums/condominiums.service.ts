import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Condominium } from './entities/condominium.entity';
import { Block } from './entities/block.entity';
import { Apartment } from './entities/apartment.entity';
import {
  CreateCondominiumDto,
  CreateBlockDto,
  CreateApartmentDto,
} from './dto/create-condominium.dto';

@Injectable()
export class CondominiumsService {
  constructor(
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    @InjectRepository(Apartment)
    private readonly apartmentRepository: Repository<Apartment>,
  ) {}

  // Condominiums
  async createCondominium(dto: CreateCondominiumDto): Promise<Condominium> {
    const condominium = this.condominiumRepository.create(dto);
    return this.condominiumRepository.save(condominium);
  }

  async findAllCondominiums(): Promise<Condominium[]> {
    return this.condominiumRepository.find({ relations: ['blocks'] });
  }

  async findOneCondominium(id: string): Promise<Condominium> {
    const condominium = await this.condominiumRepository.findOne({
      where: { id },
      relations: ['blocks'],
    });
    if (!condominium) {
      throw new NotFoundException(`Condominium with id ${id} not found`);
    }
    return condominium;
  }

  // Blocks
  async createBlock(dto: CreateBlockDto): Promise<Block> {
    // Valida se o condomínio atrelado realmente existe
    await this.findOneCondominium(dto.condominium_id);
    const block = this.blockRepository.create(dto);
    return this.blockRepository.save(block);
  }

  async findAllBlocks(): Promise<Block[]> {
    return this.blockRepository.find({
      relations: ['condominium', 'apartments'],
    });
  }

  async findOneBlock(id: string): Promise<Block> {
    const block = await this.blockRepository.findOne({
      where: { id },
      relations: ['condominium', 'apartments'],
    });
    if (!block) {
      throw new NotFoundException(`Block with id ${id} not found`);
    }
    return block;
  }

  // Apartments
  async createApartment(dto: CreateApartmentDto): Promise<Apartment> {
    // Valida se o bloco atrelado realmente existe
    await this.findOneBlock(dto.block_id);
    const apartment = this.apartmentRepository.create(dto);
    return this.apartmentRepository.save(apartment);
  }

  async findAllApartments(): Promise<Apartment[]> {
    return this.apartmentRepository.find({ relations: ['block', 'users'] });
  }

  async findOneApartment(id: string): Promise<Apartment> {
    const apartment = await this.apartmentRepository.findOne({
      where: { id },
      relations: ['block', 'users'],
    });
    if (!apartment) {
      throw new NotFoundException(`Apartment with id ${id} not found`);
    }
    return apartment;
  }
}
