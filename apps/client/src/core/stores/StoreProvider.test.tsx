import { render, screen, act } from '@testing-library/react';
import { observer } from 'mobx-react-lite';
import { StoreProvider, useRootStore, useUIStore, useAppStore, createRootStore } from './index';

const TestObserverComponent = observer(() => {
  const root = useRootStore();
  const ui = useUIStore();
  const app = useAppStore();

  return (
    <div>
      <div data-testid="theme-val">{ui.theme}</div>
      <div data-testid="network-val">{app.networkStatus}</div>
      <div data-testid="sidebar-val">{ui.isSidebarOpen ? 'open' : 'closed'}</div>
      <div data-testid="notif-count">{ui.activeNotificationCount}</div>
      <button onClick={() => ui.toggleSidebar()} data-testid="toggle-btn">
        Toggle
      </button>
      <button onClick={() => ui.setTheme('dark')} data-testid="dark-btn">
        Dark
      </button>
      <button onClick={() => app.setNetworkStatus('offline')} data-testid="offline-btn">
        Offline
      </button>
      <button
        onClick={() => {
          ui.addNotification({ message: 'test', type: 'info' });
        }}
        data-testid="add-notif-btn"
      >
        Notify
      </button>
      <div data-testid="root-same">
        {root.uiStore === ui && root.appStore === app ? 'matched' : 'mismatched'}
      </div>
    </div>
  );
});

describe('StoreProvider and MobX Hooks', () => {
  it('renders with default rootStore and supports reactivity', () => {
    render(
      <StoreProvider>
        <TestObserverComponent />
      </StoreProvider>,
    );

    expect(screen.getByTestId('theme-val')).toHaveTextContent('atiesh');
    expect(screen.getByTestId('sidebar-val')).toHaveTextContent('closed');
    expect(screen.getByTestId('network-val')).toHaveTextContent('online');
    expect(screen.getByTestId('root-same')).toHaveTextContent('matched');

    act(() => {
      screen.getByTestId('toggle-btn').click();
    });
    expect(screen.getByTestId('sidebar-val')).toHaveTextContent('open');

    act(() => {
      screen.getByTestId('dark-btn').click();
    });
    expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');

    act(() => {
      screen.getByTestId('offline-btn').click();
    });
    expect(screen.getByTestId('network-val')).toHaveTextContent('offline');

    act(() => {
      screen.getByTestId('add-notif-btn').click();
    });
    expect(screen.getByTestId('notif-count')).toHaveTextContent('1');
  });

  it('supports custom store injection via props', () => {
    const customStore = createRootStore();
    customStore.uiStore.setTheme('light');
    customStore.appStore.setNetworkStatus('offline');

    render(
      <StoreProvider store={customStore}>
        <TestObserverComponent />
      </StoreProvider>,
    );

    expect(screen.getByTestId('theme-val')).toHaveTextContent('light');
    expect(screen.getByTestId('network-val')).toHaveTextContent('offline');
  });
});
