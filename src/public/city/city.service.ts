
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityEntity } from 'src/typeorm/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(CityEntity)
    private cityRepository: Repository<CityEntity>,
  ) { }

  async getAll(query: any) {
    return this.cityRepository.findAndCount({
      where: {
        // type: query.type ? query.type : undefined,
      },
      relations: [],
      take: query.per_page ? query.per_page : 30,
      skip: query.per_page ? (query.page - 1) * query.per_page : 0
    });
  }
}
  