import { AppRouter } from './core/router';
import { QueryProvider } from './core/query';
import { StoreProvider } from './core/stores';
import './App.css';

/**
 * Root React application component orchestrating MobX stores, React Query caching, and routing.
 */
export function App() {
  return (
    <StoreProvider>
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </StoreProvider>
  );
}

export default App;
