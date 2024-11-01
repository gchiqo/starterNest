import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminEntity } from 'src/typeorm/admin.entity';
import { AdminTokenEntity } from 'src/typeorm/adminToken.entity';
import { ImageService } from 'src/custom/File.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminEntity, AdminTokenEntity])],
  controllers: [AdminController],
  providers: [AdminService, ImageService],
})
export class AdminModule { }
