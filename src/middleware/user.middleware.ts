import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from 'process';
import { UserTokenEntity } from 'src/typeorm/userToken.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(UserTokenEntity)
    private UserTokenEntityRepository: Repository<UserTokenEntity>,
  ) { }
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('user')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized, i need token' });
    }
    try {
      const decoded = jwt.verify(token, env.USER_TOKEN_SECRET);
      (req as any).user = decoded;
      if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized, invalid token' });
      }
      
      //this can be removed if you want to
      const user_blacklist_tokens = await this.UserTokenEntityRepository.findOneBy({ token });
      if (user_blacklist_tokens) {
        return res.status(401).json({ message: 'Unauthorized, you logged out' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized, error bro' });
    }
  }
}

