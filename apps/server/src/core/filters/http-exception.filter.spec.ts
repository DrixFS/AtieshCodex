import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CorrelationContextService } from '../logger';
import { CORRELATION_ID_HEADER } from '../logger';
import { GlobalHttpExceptionFilter } from './http-exception.filter';

describe('GlobalHttpExceptionFilter', () => {
  let filter: GlobalHttpExceptionFilter;
  let correlationContext: CorrelationContextService;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    correlationContext = new CorrelationContextService();
    filter = new GlobalHttpExceptionFilter(correlationContext);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should format HttpException and set correlation header in response', () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const setHeaderMock = jest.fn();

    const mockResponse = {
      status: statusMock,
      setHeader: setHeaderMock,
    };

    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        [CORRELATION_ID_HEADER]: 'test-corr-id-999',
      },
    };

    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getNext: jest.fn(),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    filter.catch(new HttpException('Forbidden resource', HttpStatus.FORBIDDEN), mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(setHeaderMock).toHaveBeenCalledWith(CORRELATION_ID_HEADER, 'test-corr-id-999');
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
        error: 'HttpException',
        correlationId: 'test-corr-id-999',
        path: '/api/test',
      }),
    );
  });

  it('should handle unhandled Error with 500 status and context correlation ID', () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const setHeaderMock = jest.fn();

    const mockResponse = {
      status: statusMock,
      setHeader: setHeaderMock,
    };

    const mockRequest = {
      method: 'POST',
      url: '/api/error-test',
      headers: {},
    };

    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getNext: jest.fn(),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    correlationContext.runWith('async-corr-id-777', () => {
      filter.catch(new Error('Database crash'), mockHost);
    });

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(setHeaderMock).toHaveBeenCalledWith(CORRELATION_ID_HEADER, 'async-corr-id-777');
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database crash',
        error: 'Error',
        correlationId: 'async-corr-id-777',
        path: '/api/error-test',
      }),
    );
  });

  it('should format object HttpException response with validation message array', () => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const setHeaderMock = jest.fn();

    const mockResponse = {
      status: statusMock,
      setHeader: setHeaderMock,
    };

    const mockRequest = {
      method: 'POST',
      url: '/api/validation',
      headers: {},
    };

    const mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getNext: jest.fn(),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn().mockReturnValue('http'),
    };

    filter.catch(
      new HttpException(
        { message: ['name is required', 'email must be valid'], error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      ),
      mockHost,
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: ['name is required', 'email must be valid'],
        error: 'Bad Request',
        path: '/api/validation',
      }),
    );
  });
});
