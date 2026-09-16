import { createContext, useContext, useMemo, type FC, type ReactNode } from 'react';
import { RootStore, rootStore as defaultRootStore } from './root.store';
import type { UIStore } from './ui.store';
import type { AppStore } from './app.store';

/**
 * React Context instance hosting the RootStore.
 */
export const StoreContext = createContext<RootStore | null>(null);

/**
 * Props for the `StoreProvider` React context wrapper.
 */
export interface StoreProviderProps {
  /** React child node hierarchy. */
  children: ReactNode;
  /** Optional custom RootStore instance (useful for unit testing and isolation). */
  store?: RootStore;
}

/**
 * React Context Provider injecting the MobX `RootStore` across the component tree.
 */
export const StoreProvider: FC<StoreProviderProps> = ({ children, store = defaultRootStore }) => {
  const value = useMemo(() => store, [store]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

/**
 * React Hook retrieving the application `RootStore`.
 * Fallbacks to global singleton if invoked outside a StoreProvider.
 */
export const useRootStore = (): RootStore => {
  const context = useContext(StoreContext);
  return context ?? defaultRootStore;
};

/**
 * React Hook retrieving the `UIStore` instance.
 */
export const useUIStore = (): UIStore => {
  const root = useRootStore();
  return root.uiStore;
};

/**
 * React Hook retrieving the `AppStore` instance.
 */
export const useAppStore = (): AppStore => {
  const root = useRootStore();
  return root.appStore;
};
