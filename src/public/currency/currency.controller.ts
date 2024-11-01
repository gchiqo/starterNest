
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) { }
  @Get()
  async getAll(@Query() query: any) {
    return await this.currencyService.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: number, @Query('relation') relation?: boolean) {
    return await this.currencyService.getOne(id, relation);
  }
}
