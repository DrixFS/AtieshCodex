import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CorrelationContextService } from '../logger';
import { CORRELATION_ID_HEADER } from '../logger';

export interface ErrorResponsePayload {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  correlationId?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractErrorMessage(responseObj: unknown, fallback: string): string | string[] {
  if (typeof responseObj === 'string') {
    return responseObj;
  }
  if (isRecord(responseObj)) {
    const rawMessage = responseObj['message'];
    if (typeof rawMessage === 'string') {
      return rawMessage;
    }
    if (Array.isArray(rawMessage)) {
      const stringItems = rawMessage.filter((item): item is string => typeof item === 'string');
      if (stringItems.length > 0) {
        return stringItems;
      }
    }
  }
  return fallback;
}

function extractErrorType(responseObj: unknown, fallback: string): string {
  if (isRecord(responseObj)) {
    const rawError = responseObj['error'];
    if (typeof rawError === 'string') {
      return rawError;
    }
  }
  return fallback;
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  constructor(private readonly correlationContext?: CorrelationContextService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = extractErrorMessage(exceptionResponse, exception.message);
      error = extractErrorType(exceptionResponse, exception.name);
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    const headerVal = request.headers?.[CORRELATION_ID_HEADER];
    const correlationId =
      this.correlationContext?.getCorrelationId() ??
      (typeof headerVal === 'string'
        ? headerVal
        : Array.isArray(headerVal)
          ? headerVal[0]
          : undefined);

    const errorPayload: ErrorResponsePayload = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url ?? 'unknown',
      ...(correlationId ? { correlationId } : {}),
    };

    if (statusCode >= 500) {
      this.logger.error(
        `[${correlationId ?? 'no-corr-id'}] ${request.method} ${request.url} failed with ${statusCode}: ${
          Array.isArray(message) ? message.join(', ') : message
        }`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${correlationId ?? 'no-corr-id'}] ${request.method} ${request.url} client error ${statusCode}: ${
          Array.isArray(message) ? message.join(', ') : message
        }`,
      );
    }

    if (correlationId) {
      response.setHeader(CORRELATION_ID_HEADER, correlationId);
    }

    response.status(statusCode).json(errorPayload);
  }
}
