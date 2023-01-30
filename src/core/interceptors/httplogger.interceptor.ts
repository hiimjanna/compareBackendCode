import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    // Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Logger } from 'log4js';

@Injectable()
export class HTTPLoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const req = context.switchToHttp().getRequest();
        const reqBody = req.body;
        const method = req.method;
        const url = req.originalUrl;
        let forwardedIPs = req.headers['x-forwarded-for'];
        if (!forwardedIPs) {
            forwardedIPs = '';
        }
        const ip =
            forwardedIPs.split(',').pop() || req.connection.remoteAddress;

        return next.handle().pipe(
            map(respBody => {
                const resp = context.switchToHttp().getResponse();
                this.printLog(
                    null,
                    reqBody,
                    respBody,
                    now,
                    ip,
                    method,
                    url,
                    resp.statusCode,
                );
                return respBody;
            }),
            catchError(error => {
                const resp = context.switchToHttp().getResponse();
                this.printLog(
                    error,
                    reqBody,
                    null,
                    now,
                    ip,
                    method,
                    url,
                    resp.statusCode,
                );
                return throwError(error);
            }),
        );
    }

    private printLog(
        error,
        reqBody,
        respBody,
        startTime: number,
        ip: string,
        method: string,
        url: string,
        statusCode,
    ) {
        const delay = Date.now() - startTime;
        if (error)
            this.logger.error(
                `${ip} ${method} ${url} ${statusCode} ${delay}ms request:${JSON.stringify(
                    reqBody,
                )} respones:${JSON.stringify(respBody)} error:${error.stack}`,
            );
        else
            this.logger.debug(
                `${ip} ${method} ${url} ${statusCode} ${delay}ms request:${JSON.stringify(
                    reqBody,
                )} respones:${JSON.stringify(respBody)}`,
            );
    }
}
