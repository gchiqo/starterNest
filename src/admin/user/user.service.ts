
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageService } from 'src/custom/File.service';
import { UserEntity } from 'src/typeorm/user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

type ImageFile = {
  buffer: Buffer;
  originalname: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly imageService: ImageService,
  ) { }

  async create(userDto: CreateUserDto, image?: ImageFile): Promise<UserEntity> {
    
    if (image) {
      const imgPath = await this.imageService.saveImage(image, 'user');
      userDto.img = imgPath;
    }
    
    const newUser = this.userRepository.create(userDto);
    const createdUser = await this.userRepository.save(newUser);

    return this.getOne(createdUser.id);
  }

  async update(id: number, userDto: UpdateUserDto, image?: ImageFile): Promise<UserEntity> {
    const existingUser = await this.getOne(id);
    
    if (image) {
      if (existingUser.img) {
        await this.imageService.deleteImage(existingUser.img);
      }
      userDto.img = await this.imageService.saveImage(image, 'user');
    }
    
    await this.userRepository.update(id, userDto);

    return this.getOne(id);
  }

  async getOne(id: number, relation?: boolean): Promise<UserEntity> {
    const relations = relation ? [] : []

    const user = await this.userRepository.findOne({ where: { id }, relations: relations });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async getAll(query: any) {
    return this.userRepository.find({
      where: {
        // type: query.type ? query.type : undefined,
      },
      relations: [],
      take: query.per_page ? query.per_page : 30,
      skip: query.per_page ? (query.page - 1) * query.per_page : 0
    });
  }

  async delete(id: number): Promise<void> {
    const existingUser = await this.getOne(id);
    
    if (existingUser.img) {
      await this.imageService.deleteImage(existingUser.img);
    }
    
    await this.userRepository.delete(id);
  }
}
  