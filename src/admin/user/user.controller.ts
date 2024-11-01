
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('a/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() image: { buffer: Buffer; originalname: string },
  ) {
    return await this.userService.create(createUserDto, image);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: { buffer: Buffer; originalname: string },
  ) {
    return await this.userService.update(id, updateUserDto, image);
  }

  @Get()
  async getAll(@Query() query: any) {
    return await this.userService.getAll(query);
  }

  @Get(':id')
  async getById(@Param('id') id: number, @Query('relation') relation?: boolean) {
    return await this.userService.getOne(id, relation);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.userService.delete(id);
  }
}
