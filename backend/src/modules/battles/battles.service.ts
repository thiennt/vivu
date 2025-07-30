import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Battle } from '../../entities/battle.entity';

@Injectable()
export class BattlesService {
  constructor(
    @InjectRepository(Battle)
    private battlesRepository: Repository<Battle>,
  ) {}

  async findAll(): Promise<Battle[]> {
    return this.battlesRepository.find({
      relations: ['character1', 'character2'],
    });
  }

  async findOne(id: number): Promise<Battle | null> {
    return this.battlesRepository.findOne({
      where: { id },
      relations: ['character1', 'character2', 'battleHistories'],
    });
  }

  async create(battleData: Partial<Battle>): Promise<Battle> {
    const battle = this.battlesRepository.create(battleData);
    return this.battlesRepository.save(battle);
  }

  async update(
    id: number,
    battleData: Partial<Battle>,
  ): Promise<Battle | null> {
    await this.battlesRepository.update(id, battleData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.battlesRepository.delete(id);
  }
}
