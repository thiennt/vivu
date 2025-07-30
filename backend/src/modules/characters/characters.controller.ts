import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CharactersService } from './characters.service';
import { Character } from '../../entities/character.entity';

@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  async findAll(): Promise<Character[]> {
    return this.charactersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Character | null> {
    return this.charactersService.findOne(id);
  }

  @Post()
  async create(@Body() characterData: Partial<Character>): Promise<Character> {
    return this.charactersService.create(characterData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() characterData: Partial<Character>,
  ): Promise<Character | null> {
    return this.charactersService.update(id, characterData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.charactersService.remove(id);
  }
}
