import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders landing page heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Atiesh Codex');
  });
});
