import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../../entities/character.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
  ) {}

  async findAll(): Promise<Character[]> {
    return this.charactersRepository.find();
  }

  async findOne(id: number): Promise<Character | null> {
    return this.charactersRepository.findOne({ where: { id } });
  }

  async create(characterData: Partial<Character>): Promise<Character> {
    const character = this.charactersRepository.create(characterData);
    return this.charactersRepository.save(character);
  }

  async update(
    id: number,
    characterData: Partial<Character>,
  ): Promise<Character | null> {
    await this.charactersRepository.update(id, characterData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.charactersRepository.delete(id);
  }
}
