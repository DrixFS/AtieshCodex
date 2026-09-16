import { RootStore, createRootStore, rootStore } from './root.store';

describe('RootStore', () => {
  it('instantiates child stores properly', () => {
    const store = new RootStore();
    expect(store.uiStore).toBeDefined();
    expect(store.appStore).toBeDefined();
    expect(store.uiStore.getRootStore()).toBe(store);
    expect(store.appStore.getRootStore()).toBe(store);
  });

  it('createRootStore creates fresh independent instance', () => {
    const storeA = createRootStore();
    const storeB = createRootStore();
    expect(storeA).not.toBe(storeB);
    expect(storeA.uiStore).not.toBe(storeB.uiStore);
  });

  it('exports a default rootStore singleton', () => {
    expect(rootStore).toBeInstanceOf(RootStore);
  });
});
