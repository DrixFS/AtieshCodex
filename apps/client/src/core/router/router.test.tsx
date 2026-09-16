import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { appRoutes, ROUTES } from './index';

describe('Router', () => {
  it('defines the HOME route as /', () => {
    expect(ROUTES.HOME).toBe('/');
  });

  it('renders LandingPage at the root route', () => {
    const memoryRouter = createMemoryRouter(appRoutes, {
      initialEntries: [ROUTES.HOME],
    });

    render(<RouterProvider router={memoryRouter} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Atiesh Codex');
  });
});
