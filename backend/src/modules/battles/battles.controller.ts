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
import { BattlesService } from './battles.service';
import { Battle } from '../../entities/battle.entity';

@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Get()
  async findAll(): Promise<Battle[]> {
    return this.battlesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Battle | null> {
    return this.battlesService.findOne(id);
  }

  @Post()
  async create(@Body() battleData: Partial<Battle>): Promise<Battle> {
    return this.battlesService.create(battleData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() battleData: Partial<Battle>,
  ): Promise<Battle | null> {
    return this.battlesService.update(id, battleData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.battlesService.remove(id);
  }
}
