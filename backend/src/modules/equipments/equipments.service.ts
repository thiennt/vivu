import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';

@Injectable()
export class EquipmentsService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentsRepository: Repository<Equipment>,
  ) {}

  async findAll(): Promise<Equipment[]> {
    return this.equipmentsRepository.find();
  }

  async findOne(id: number): Promise<Equipment | null> {
    return this.equipmentsRepository.findOne({ where: { id } });
  }

  async findByType(type: string): Promise<Equipment[]> {
    return this.equipmentsRepository.find({ where: { type } });
  }

  async create(equipmentData: Partial<Equipment>): Promise<Equipment> {
    const equipment = this.equipmentsRepository.create(equipmentData);
    return this.equipmentsRepository.save(equipment);
  }

  async update(
    id: number,
    equipmentData: Partial<Equipment>,
  ): Promise<Equipment | null> {
    await this.equipmentsRepository.update(id, equipmentData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.equipmentsRepository.delete(id);
  }
}
