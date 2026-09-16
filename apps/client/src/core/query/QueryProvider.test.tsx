import { render, screen, waitFor } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { QueryProvider } from './QueryProvider';
import { createQueryClient } from './query-client';

function TestConsumer() {
  const { data, isLoading } = useQuery({
    queryKey: ['test-query'],
    queryFn: () => Promise.resolve('data-loaded-successfully'),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Result: {data}</div>;
}

describe('QueryProvider', () => {
  it('renders children correctly', () => {
    render(
      <QueryProvider>
        <div>Test Child Content</div>
      </QueryProvider>,
    );

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('provides working query context to child components', async () => {
    const customClient = createQueryClient();

    render(
      <QueryProvider client={customClient}>
        <TestConsumer />
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Result: data-loaded-successfully')).toBeInTheDocument();
    });
  });
});
