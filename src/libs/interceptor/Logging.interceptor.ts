import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger: Logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const recordTime = Date.now();
        const requestType = context.getType();

        if (requestType === 'http') {
            const httpContext = context.switchToHttp();
            const request = httpContext.getRequest<Request>();
            const response = httpContext.getResponse<Response>();

            const { method, originalUrl, query, body, ip } = request;
            const userAgent = request.get('user-agent') || '';

            // Log Request
            const requestLog = {
                method,
                url: originalUrl,
                query: Object.keys(query).length > 0 ? query : undefined,
                body: this.sanitizeBody(body),
                ip,
                userAgent,
            };

            this.logger.log(
                `${method} ${originalUrl} ${this.stringify(requestLog)}`,
                'REQUEST',
            );

            // Log Response
            return next.handle().pipe(
                tap({
                    next: (data) => {
                        const responseTime = Date.now() - recordTime;
                        const statusCode = response.statusCode;

                        const responseLog = {
                            statusCode,
                            responseTime: `${responseTime}ms`,
                            data: this.truncateData(data),
                        };

                        this.logger.log(
                            `${method} ${originalUrl} ${statusCode} - ${responseTime}ms ${this.stringify(responseLog)}`,
                            'RESPONSE',
                        );
                    },
                    error: (error) => {
                        const responseTime = Date.now() - recordTime;
                        const statusCode = error?.status || response.statusCode || 500;

                        this.logger.error(
                            `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${error?.message || 'Internal Server Error'}`,
                            error?.stack,
                            'RESPONSE',
                        );
                    },
                }),
            );
        }

        return next.handle();
    }

    private stringify(data: any): string {
        try {
            const stringified = JSON.stringify(data);
            return stringified.length > 200 ? `${stringified.slice(0, 200)}...` : stringified;
        } catch (error) {
            return String(data);
        }
    }

    private sanitizeBody(body: any): any {
        if (!body) return undefined;

        const sanitized = { ...body };
        // Parol va shunga o'xshash sensitive ma'lumotlarni yashirish
        if (sanitized.password) {
            sanitized.password = '***';
        }
        if (sanitized.passwordHash) {
            sanitized.passwordHash = '***';
        }
        if (sanitized.token) {
            sanitized.token = '***';
        }

        return sanitized;
    }

    private truncateData(data: any): any {
        if (!data) return data;

        try {
            const stringified = JSON.stringify(data);
            if (stringified.length > 500) {
                return JSON.parse(stringified.slice(0, 500) + '...');
            }
            return data;
        } catch {
            return typeof data === 'string' && data.length > 500 ? `${data.slice(0, 500)}...` : data;
        }
    }
}
