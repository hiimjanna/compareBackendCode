import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class HTTPStatusInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(respBody => {
                const resp = context.switchToHttp().getResponse();
                resp.status(200);
                return respBody;
            }),
            catchError(error => {
                const resp = context.switchToHttp().getResponse();
                let exStatus = null;
                if (error != null) {
                    if (error instanceof HttpException)
                        exStatus = error.getStatus();
                }
                const status = exStatus || HttpStatus.INTERNAL_SERVER_ERROR;
                resp.status(status);
                return throwError(error);
            }),
        );
    }
}
