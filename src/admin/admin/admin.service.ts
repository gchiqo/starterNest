import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/typeorm/admin.entity';
import { CreateAdminDto, UpdateAdminDto } from './admin.dto';
import { promisify } from 'util';
import * as bcrypt from 'bcryptjs';
import { AdminTokenEntity } from 'src/typeorm/adminToken.entity';
import { Not, Repository } from 'typeorm';
import { ImageService } from 'src/custom/File.service';

type ImageFile = {
  buffer: Buffer;
  originalname: string;
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private adminRepository: Repository<AdminEntity>,
    private readonly imageService: ImageService,
    @InjectRepository(AdminTokenEntity)
    private AdminTokenEntityRepository: Repository<AdminTokenEntity>,
  ) { }

  async create(
    adminDto: CreateAdminDto,
    image?: ImageFile,
  ): Promise<AdminEntity> {

    if (image) {
      const imgPath = await this.imageService.saveImage(image, 'admin');
      adminDto.img = imgPath;
    }

    const hashedPassword = await bcrypt.hash(adminDto.password, 10);
    try {
      const newAdmin = this.adminRepository.create({
        ...adminDto,
        password: hashedPassword,
      });
      const createdAdmin = await this.adminRepository.save(newAdmin);
      return this.getOne(createdAdmin.id)
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    id: number,
    adminDto: UpdateAdminDto,
    image?: ImageFile,
  ) {
    const existingAdmin = await this.getOne(id);
    //ToDo here you should fetch current adin and see if its role allows to change this data
    if (image) {
      if (existingAdmin.img)
        await this.imageService.deleteImage(existingAdmin.img);
      adminDto.img = await this.imageService.saveImage(image, 'admin');
    }

    if (adminDto.password)
      adminDto.password = await bcrypt.hash(adminDto.password, 10);

    return await this.adminRepository.update(id, adminDto);
  }

  async getOne(id: number): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) throw new NotFoundException(`Admin with ID ${id} not found`);

    return admin;
  }

  async getAll(query) {
    return await this.adminRepository.findAndCount({
      where: { role: query.role ?? undefined },
      take: query.per_page ? query.per_page : 30,
      skip: query.per_page ? (query.page - 1) * query.per_page : 0
    });
  }

  async delete(id: number): Promise<void> {
    const existingAdmin = await this.getOne(id);
    //ToDo here you should fetch current adin and see if its role allows to change this data
    //ToDo sometimes admin should not be dleted (you might need status)
    if (existingAdmin.img)
      await this.imageService.deleteImage(existingAdmin.img);

    await this.adminRepository.delete(id);
  }

  async current(admin_id: number): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({ where: { id: admin_id } });
    if (!admin)
      throw new HttpException('Admin not found.', HttpStatus.BAD_REQUEST);
    return admin;
  }

  async logout(admin_id: number, adminToken: string) {
    try {
      const currentAdin = await this.current(admin_id);
      const token = adminToken.split(' ')[1];

      const newBlackListToken = await this.AdminTokenEntityRepository.create({
        admin_id: currentAdin.id,
        token: token,
      });

      await this.AdminTokenEntityRepository.save(newBlackListToken)

      return 'logged out';
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
