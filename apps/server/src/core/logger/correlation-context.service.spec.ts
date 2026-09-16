import { CorrelationContextService } from './correlation-context.service';

describe('CorrelationContextService', () => {
  let service: CorrelationContextService;

  beforeEach(() => {
    service = new CorrelationContextService();
  });

  it('should return undefined when no context is active', () => {
    expect(service.getCorrelationId()).toBeUndefined();
  });

  it('should store and retrieve correlation ID within runWith block', () => {
    const testId = 'test-correlation-1234';

    service.runWith(testId, () => {
      expect(service.getCorrelationId()).toBe(testId);
    });

    expect(service.getCorrelationId()).toBeUndefined();
  });

  it('should handle nested runWith contexts correctly', () => {
    const outerId = 'outer-id-1';
    const innerId = 'inner-id-2';

    service.runWith(outerId, () => {
      expect(service.getCorrelationId()).toBe(outerId);

      service.runWith(innerId, () => {
        expect(service.getCorrelationId()).toBe(innerId);
      });

      expect(service.getCorrelationId()).toBe(outerId);
    });
  });
});
