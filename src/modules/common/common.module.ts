import { Global, Module, Scope, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TimeoutInterceptor } from '../../framework/interceptor/timeout.interceptor';
import { ExceptionsHandler } from '../../framework/error-handling/exception-handling';
import { SearchQueryResponseInterceptor } from '../../framework/interceptor/api-response.interceptor';

@Global()
@Module({
  providers: [
    {
      scope: Scope.DEFAULT,
      provide: 'MOMENT_TIMEZONE',
      useFactory:
        (configService: ConfigService) =>
        (input: Date | string, format?: string): moment.Moment =>
          moment(input, format, true).tz(
            configService.get<string>('APP_TIMEZONE', 'Asia/Singapore'),
          ),
      inject: [ConfigService],
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SearchQueryResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionsHandler,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  exports: ['MOMENT_TIMEZONE'],
})
export class CommonModule {}
