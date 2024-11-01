import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return 'Hello World!'+Math.floor(1000 + Math.random() * 9000)+__dirname;
  }
}
