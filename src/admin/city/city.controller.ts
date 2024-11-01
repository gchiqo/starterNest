
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto, UpdateCityDto } from './city.dto';

@Controller('a/city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  async create(
    @Body() createCityDto: CreateCityDto,
  ) {
    return await this.cityService.create(createCityDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return await this.cityService.update(id, updateCityDto);
  }

  @Get()
  async getAll(@Query() query: any) {
    return await this.cityService.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: number, @Query('relation') relation?: boolean) {
    return await this.cityService.getOne(id, relation);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.cityService.delete(id);
  }
}
  