
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityEntity } from 'src/typeorm/city.entity';
import { CreateCityDto, UpdateCityDto } from './city.dto';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(CityEntity)
    private cityRepository: Repository<CityEntity>,
  ) { }

  async create(cityDto: CreateCityDto): Promise<CityEntity> {
    
    const newCity = this.cityRepository.create(cityDto);
    const createdCity = await this.cityRepository.save(newCity);

    return this.getOne(createdCity.id);
  }

  async update(id: number, cityDto: UpdateCityDto): Promise<CityEntity> {
    const existingCity = await this.getOne(id);
    
    await this.cityRepository.update(id, cityDto);

    return this.getOne(id);
  }

  async getOne(id: number, relation?: boolean): Promise<CityEntity> {
    const relations = relation ? [] : []

    const city = await this.cityRepository.findOne({ where: { id }, relations: relations });
    if (!city) throw new NotFoundException(`City with ID ${id} not found`);
    return city;
  }

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

  async delete(id: number): Promise<void> {
    const existingCity = await this.getOne(id);
    
    await this.cityRepository.delete(id);
  }
}
  