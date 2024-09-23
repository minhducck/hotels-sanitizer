import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

/**
 * Convert the response from database and wrap data into response format
 * { "searchResult": {}, totalCollectionSize: number }
 */
@Injectable()
export class SearchQueryResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        return {
          searchResult: data[0],
          totalCollectionSize: data[1],
        };
      }),
    );
  }
}
