import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { APIResponse } from '../types/api-response.type';
import { initApiResponse } from '../helper/init-api-response.helper';

@Injectable()
export class SearchQueryResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<APIResponse<any>> | Promise<Observable<APIResponse<any>>> {
    return next.handle().pipe(map((data) => initApiResponse(data)));
  }
}
