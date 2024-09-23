import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { ApiErrorResponseType } from '../types/api-response.type';
import { ConfigService } from '@nestjs/config';

@Catch(HttpException)
export class ExceptionsHandler implements ExceptionFilter {
  constructor(
    @Inject(ConfigService) private readonly appConfig: ConfigService,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const wrappedExceptionContent: ApiErrorResponseType = {
      name: exception.name,
      error: true,
      message: exception.getResponse()['message'] ?? exception.message,
      statusCode: exception.getStatus(),
    };

    if (this.appConfig.get<string>('NODE_ENV', 'dev') === 'dev') {
      res.status(exception.getStatus()).json({
        ...wrappedExceptionContent,
        trace: exception.stack,
        detailMessages: res.message,
      } as ApiErrorResponseType);
      return;
    }

    res.status(exception.getStatus()).json(wrappedExceptionContent);
  }
}
