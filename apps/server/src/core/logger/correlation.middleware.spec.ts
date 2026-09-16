import { CorrelationContextService } from './correlation-context.service';
import {
  CorrelationMiddleware,
  RequestWithHeaders,
  ResponseWithSetHeader,
} from './correlation.middleware';
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from './logger.constants';

describe('CorrelationMiddleware', () => {
  let middleware: CorrelationMiddleware;
  let correlationContext: CorrelationContextService;

  beforeEach(() => {
    correlationContext = new CorrelationContextService();
    middleware = new CorrelationMiddleware(correlationContext);
  });

  it('should reuse existing x-correlation-id header and set response header', () => {
    const existingId = 'existing-corr-123';
    const req: RequestWithHeaders = {
      headers: { [CORRELATION_ID_HEADER]: existingId },
    };
    const setHeader = jest.fn();
    const res: ResponseWithSetHeader = {
      setHeader,
    };

    let capturedContextId: string | undefined;
    const next = jest.fn(() => {
      capturedContextId = correlationContext.getCorrelationId();
    });

    middleware.use(req, res, next);

    expect(setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, existingId);
    expect(req.headers[CORRELATION_ID_HEADER]).toBe(existingId);
    expect(next).toHaveBeenCalledTimes(1);
    expect(capturedContextId).toBe(existingId);
  });

  it('should reuse existing x-request-id if x-correlation-id is not provided', () => {
    const requestId = 'req-trace-456';
    const req: RequestWithHeaders = {
      headers: { [REQUEST_ID_HEADER]: requestId },
    };
    const setHeader = jest.fn();
    const res: ResponseWithSetHeader = {
      setHeader,
    };

    let capturedContextId: string | undefined;
    const next = jest.fn(() => {
      capturedContextId = correlationContext.getCorrelationId();
    });

    middleware.use(req, res, next);

    expect(setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, requestId);
    expect(req.headers[CORRELATION_ID_HEADER]).toBe(requestId);
    expect(next).toHaveBeenCalledTimes(1);
    expect(capturedContextId).toBe(requestId);
  });

  it('should generate a new UUID when no correlation header is provided', () => {
    const req: RequestWithHeaders = {
      headers: {},
    };
    const setHeader = jest.fn();
    const res: ResponseWithSetHeader = {
      setHeader,
    };

    let capturedContextId: string | undefined;
    const next = jest.fn(() => {
      capturedContextId = correlationContext.getCorrelationId();
    });

    middleware.use(req, res, next);

    expect(setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, expect.any(String));
    expect(typeof req.headers[CORRELATION_ID_HEADER]).toBe('string');
    expect(req.headers[CORRELATION_ID_HEADER]?.length).toBeGreaterThan(10);
    expect(next).toHaveBeenCalledTimes(1);
    expect(capturedContextId).toBe(req.headers[CORRELATION_ID_HEADER]);
  });
});
