import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExeptionHendaler implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;


    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Extracting the code from the exception
    const exceptionCode = exception?.code || 'OTHER_ERROR';

    if (status == HttpStatus.INTERNAL_SERVER_ERROR) {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
        code: exceptionCode,
        full: exception
      });
    } else
      response.status(status).json(message);
  }
}
//ToDo this is not good one 