
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateCurrencyDto, UpdateCurrencyDto } from './currency.dto';
import { CurrencyService } from './currency.service';

@Controller('a/currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  async create(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ) {
    return await this.currencyService.create(createCurrencyDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return await this.currencyService.update(id, updateCurrencyDto);
  }

  @Get()
  async getAll(@Query() query: any) {
    return await this.currencyService.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: number, @Query('relation') relation?: boolean) {
    return await this.currencyService.getOne(id, relation);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.currencyService.delete(id);
  }
}
  