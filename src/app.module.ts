import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { env } from 'process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AdminEntity } from './typeorm/admin.entity';
import { AdminTokenEntity } from './typeorm/adminToken.entity';
import { CityEntity } from './typeorm/city.entity';
import { CurrencyEntity } from './typeorm/currency.entity';
import { LoginAttemptEntity } from './typeorm/LoginAttempt.entity';
import { UserEntity } from './typeorm/user.entity';
import { UserTokenEntity } from './typeorm/userToken.entity';
import { VerificationCodeEntity } from './typeorm/verificationCode.entity';

import { ClassValidatorExtendModule } from './custom/validator/classvalidatorextend.module';

import { AdminMiddleware } from './middleware/admin.middleware';
import { UserMiddleware } from './middleware/user.middleware';
import { AuthMiddlewareModule } from './middleware/authmiddleware.module';


import { AdminModule as AdminAdminModule } from './admin/admin/admin.module';
import { CityModule as AdminCityModule } from './admin/city/city.module';
import { CurrencyModule as AdminCurrencyModule } from './admin/currency/currency.module';
import { UserModule as AdminUserModule } from './admin/user/user.module';
import { VerificationCodeModule as AdminVerificationCodeModule } from './admin/verificationCode/verificationCode.module';
import { AdminAuthModule } from './public/adminAuth/adminAuth.module';
import { CityModule } from './public/city/city.module';
import { CurrencyModule } from './public/currency/currency.module';
import { UserAuthModule } from './public/userAuth/userAuth.module';
import { AdminController } from './admin/admin/admin.controller';
import { CityController } from './admin/city/city.controller';
import { CurrencyController } from './admin/currency/currency.controller';




@Module({
  imports: [
    ConfigModule.forRoot(),//env is not working without it // npm install --save @nestjs/config   
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_DATABASE,
      entities: [
        AdminEntity,
        AdminTokenEntity,
        CityEntity,
        CurrencyEntity,
        LoginAttemptEntity,
        UserEntity,
        UserTokenEntity,
        VerificationCodeEntity,
      ],
      synchronize: true,
    }),
    // modules

    ClassValidatorExtendModule,//custom validators
    AuthMiddlewareModule,//middewares don't work without this

    //admin modules
    AdminAdminModule,
    AdminCityModule,
    AdminCurrencyModule,
    AdminUserModule,
    AdminVerificationCodeModule,

    //public modules
    AdminAuthModule,
    CityModule,
    CurrencyModule,
    UserAuthModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    consumer.apply(AdminMiddleware).forRoutes({ path: '/a/*', method: RequestMethod.ALL });

    consumer.apply(UserMiddleware).forRoutes({ path: '/u/*', method: RequestMethod.ALL });
  }
}

// export class AppModule { }