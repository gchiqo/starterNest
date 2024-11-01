
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CityService } from './city.service';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) { }

  @Get()
  async getAll(@Query() query: any) {
    return await this.cityService.getAll(query);
  }

}
