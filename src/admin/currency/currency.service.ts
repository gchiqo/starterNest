
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from 'src/typeorm/currency.entity';
import { CreateCurrencyDto, UpdateCurrencyDto } from './currency.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
  ) { }

  async create(currencyDto: CreateCurrencyDto): Promise<CurrencyEntity> {
    
    const newCurrency = this.currencyRepository.create(currencyDto);
    const createdCurrency = await this.currencyRepository.save(newCurrency);

    return this.getOne(createdCurrency.id);
  }

  async update(id: number, currencyDto: UpdateCurrencyDto): Promise<CurrencyEntity> {
    const existingCurrency = await this.getOne(id);
    
    await this.currencyRepository.update(id, currencyDto);

    return this.getOne(id);
  }

  async getOne(id: number, relation?: boolean): Promise<CurrencyEntity> {
    const relations = relation ? [] : []

    const currency = await this.currencyRepository.findOne({ where: { id }, relations: relations });
    if (!currency) throw new NotFoundException(`Currency with ID ${id} not found`);
    return currency;
  }

  async getAll(query: any) {
    return this.currencyRepository.find({
      where: {
        // type: query.type ? query.type : undefined,
      },
      relations: [],
      take: query.per_page ? query.per_page : 30,
      skip: query.per_page ? (query.page - 1) * query.per_page : 0
    });
  }

  async delete(id: number): Promise<void> {
    const existingCurrency = await this.getOne(id);
    
    await this.currencyRepository.delete(id);
  }
}
  