import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationCodeEntity } from 'src/typeorm/verificationCode.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VerificationCodeService {
  constructor(
    @InjectRepository(VerificationCodeEntity)
    private verificationCodeRepository: Repository<VerificationCodeEntity>,
  ) { }


  async getAll(query: any): Promise<[VerificationCodeEntity[], number]> {
    return await this.verificationCodeRepository.findAndCount({
      where: {
        phone: query.phone ? query.phone : undefined,
        email: query.email ? query.email : undefined,
      },
      take: query.per_page ? query.per_page : 30,
      skip: query.per_page ? (query.page - 1) * query.per_page : 0
    });
  }

}