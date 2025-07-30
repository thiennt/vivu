import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { Equipment } from '../../entities/equipment.entity';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Get()
  async findAll(@Query('type') type?: string): Promise<Equipment[]> {
    if (type) {
      return this.equipmentsService.findByType(type);
    }
    return this.equipmentsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Equipment | null> {
    return this.equipmentsService.findOne(id);
  }

  @Post()
  async create(@Body() equipmentData: Partial<Equipment>): Promise<Equipment> {
    return this.equipmentsService.create(equipmentData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() equipmentData: Partial<Equipment>,
  ): Promise<Equipment | null> {
    return this.equipmentsService.update(id, equipmentData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.equipmentsService.remove(id);
  }
}
