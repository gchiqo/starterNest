import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from 'process';
import * as dotenv from 'dotenv'
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { ExeptionHendaler } from './custom/ExeptionHendaler';
import { join } from 'path';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  dotenv.config()//env is not working without it  npm install --save @nestjs/config   

  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    index: false,
    prefix: '/uploads',
  });


  app.enableCors();//send requests from enywhere

  useContainer(app.select(AppModule), { fallbackOnErrors: true });//return errors
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))//return errors

  // app.useGlobalFilters(new ExeptionHendaler());//custom exeption hendaler

  await app.listen(env.APP_PORT);
  //kukusha
  //k233434
}
bootstrap();
