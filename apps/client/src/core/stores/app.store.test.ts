import { RootStore } from './root.store';
import { AppStore } from './app.store';

describe('AppStore', () => {
  it('initializes with default state', () => {
    const rootStore = new RootStore();
    const appStore = new AppStore(rootStore);

    expect(appStore.isInitialized).toBe(false);
    expect(appStore.networkStatus).toBe('online');
    expect(appStore.lastPingTimestamp).toBeNull();
    expect(appStore.isReady).toBe(false);
  });

  it('updates initialized and network status', () => {
    const rootStore = new RootStore();
    const appStore = new AppStore(rootStore);

    appStore.setInitialized(true);
    expect(appStore.isReady).toBe(true);

    appStore.setNetworkStatus('offline');
    expect(appStore.networkStatus).toBe('offline');
    expect(appStore.isReady).toBe(false);
  });

  it('records ping timestamps and resets', () => {
    const rootStore = new RootStore();
    const appStore = new AppStore(rootStore);

    const time = 123456789;
    const corrId = 'ping-corr-555';
    appStore.recordPing(time, corrId);
    expect(appStore.lastPingTimestamp).toBe(time);
    expect(appStore.lastPingCorrelationId).toBe(corrId);

    appStore.setInitialized(true);
    appStore.setNetworkStatus('offline');
    appStore.reset();

    expect(appStore.isInitialized).toBe(false);
    expect(appStore.networkStatus).toBe('online');
    expect(appStore.lastPingTimestamp).toBeNull();
    expect(appStore.lastPingCorrelationId).toBeNull();
  });
});
