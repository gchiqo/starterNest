
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from 'src/typeorm/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
  ) { }

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
}
  