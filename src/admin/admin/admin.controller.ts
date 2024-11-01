import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Headers,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto } from './admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToClass } from 'class-transformer';


@Controller('a/admin')
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() adminDto: CreateAdminDto,
    @UploadedFile() image: { buffer: Buffer; originalname: string },
  ) {
    return await this.adminService.create(adminDto, image);;
  }

  @Get()
  async getAll(@Query() query?: any) {
    return await this.adminService.getAll(query);
  }

  @Get('current')
  async Current(@Req() request: any) {
    const admin_id = request.admin.sub;
    return await this.adminService.current(admin_id);
  }

  @Get('logout')
  async logOut(@Req() request: any, @Headers('Authorization') token: string) {
    const admin_id = request.admin.sub;
    return await this.adminService.logout(admin_id, token);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body(ValidationPipe) adminDto: UpdateAdminDto,
    @UploadedFile() image: { buffer: Buffer; originalname: string },
  ) {

    const serviceAdminDto = plainToClass(CreateAdminDto, adminDto);
    const createdAdmin = await this.adminService.update(id, serviceAdminDto, image);
    return createdAdmin;
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.adminService.delete(id);
  }
}
