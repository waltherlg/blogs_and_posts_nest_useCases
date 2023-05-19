import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
@Catch(Error)
export class ErrorExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    if (process.env.envorinment !== 'production') {
      response
        .status(500)
        .send({ error: exception.toString(), stack: exception.stack });
    } else {
      response.status(500).send('some error occurred');
    }
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errors: any = exception.getResponse();
    console.log(errors);
    let errorsMessages;

    if (Array.isArray(errors.message)) {
      errorsMessages = { errorsMessages: errors.message };
    } else if (typeof errors.message === 'string') {
      errorsMessages = {
        errorsMessages: [
          {
            message: errors.message,
            field: errors.field || errors.error,
          },
        ],
      };
      // errorMessages = {
      //   statusCode: status,
      //   timestamp: new Date().toISOString(),
      //   path: request.url,
      // };
    } else {
      errorsMessages = {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }
    response.status(status).send(errorsMessages);
  }
}
