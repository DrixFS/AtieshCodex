import { RootStore } from './root.store';
import { UIStore } from './ui.store';

describe('UIStore', () => {
  it('initializes with default values', () => {
    const rootStore = new RootStore();
    const uiStore = new UIStore(rootStore);

    expect(uiStore.theme).toBe('atiesh');
    expect(uiStore.isSidebarOpen).toBe(false);
    expect(uiStore.notifications).toEqual([]);
    expect(uiStore.activeNotificationCount).toBe(0);
    expect(uiStore.isDarkMode).toBe(true);
  });

  it('updates theme and computed isDarkMode', () => {
    const rootStore = new RootStore();
    const uiStore = new UIStore(rootStore);

    uiStore.setTheme('light');
    expect(uiStore.theme).toBe('light');
    expect(uiStore.isDarkMode).toBe(false);

    uiStore.setTheme('dark');
    expect(uiStore.theme).toBe('dark');
    expect(uiStore.isDarkMode).toBe(true);

    uiStore.setTheme('atiesh');
    expect(uiStore.theme).toBe('atiesh');
    expect(uiStore.isDarkMode).toBe(true);
  });

  it('toggles and sets sidebar state', () => {
    const rootStore = new RootStore();
    const uiStore = new UIStore(rootStore);

    uiStore.toggleSidebar();
    expect(uiStore.isSidebarOpen).toBe(true);

    uiStore.toggleSidebar();
    expect(uiStore.isSidebarOpen).toBe(false);

    uiStore.setSidebarOpen(true);
    expect(uiStore.isSidebarOpen).toBe(true);
  });

  it('manages notifications lifecycle', () => {
    const rootStore = new RootStore();
    const uiStore = new UIStore(rootStore);

    const id1 = uiStore.addNotification({
      id: 'custom-1',
      message: 'Server online',
      type: 'success',
      correlationId: 'trace-notif-123',
    });
    expect(id1).toBe('custom-1');
    expect(uiStore.notifications[0]?.correlationId).toBe('trace-notif-123');

    const id2 = uiStore.addNotification({
      message: 'Connection warning',
      type: 'warning',
    });
    expect(id2).toBeDefined();
    expect(uiStore.activeNotificationCount).toBe(2);

    uiStore.removeNotification(id1);
    expect(uiStore.activeNotificationCount).toBe(1);
    expect(uiStore.notifications[0]?.id).toBe(id2);

    uiStore.clearNotifications();
    expect(uiStore.activeNotificationCount).toBe(0);
    expect(uiStore.notifications).toEqual([]);
  });
});
