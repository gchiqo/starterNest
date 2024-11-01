import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from 'process';
import { AdminTokenEntity } from 'src/typeorm/adminToken.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(AdminTokenEntity)
    private AdminTokenEntityRepository: Repository<AdminTokenEntity>,
  ) { }
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('admin')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized, i need token' });
    }
    try {
      const decoded = jwt.verify(token, env.ADMIN_TOKEN_SECRET);
      (req as any).admin = decoded;
      if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized, invalid token' });
      }
      
      //this can be removed if you want to
      const admin_blacklist_tokens = await this.AdminTokenEntityRepository.findOneBy({ token });
      if (admin_blacklist_tokens) {
        return res.status(401).json({ message: 'Unauthorized, you logged out' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized, error bro' });
    }
  }
}

