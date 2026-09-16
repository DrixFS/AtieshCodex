import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { StoreProvider, createRootStore } from '../stores';

describe('MainLayout', () => {
  it('renders child routes via Outlet inside layout wrapper', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/test" element={<div data-testid="child-content">Nested Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('child-content')).toHaveTextContent('Nested Content');
  });

  it('reflects theme from MobX UIStore in layout wrapper class', () => {
    const store = createRootStore();
    store.uiStore.setTheme('dark');

    const { container } = render(
      <StoreProvider store={store}>
        <MemoryRouter initialEntries={['/test']}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/test" element={<div>Test</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </StoreProvider>,
    );

    const layoutElement = container.querySelector('.app-layout');
    expect(layoutElement).toHaveClass('theme-dark');
  });
});
