import { UIStore } from './ui.store';
import { AppStore } from './app.store';
import type { IRootStore } from './root.store.interface';

/**
 * Root MobX store coordinating all specialized sub-stores in the client application.
 * Manages UI state, application lifecycle, and domain data with dependency injection.
 */
export class RootStore implements IRootStore {
  /** Store for UI themes, notifications, and navigation state. */
  public readonly uiStore: UIStore;
  /** Store for application lifecycle, network status, and health metrics. */
  public readonly appStore: AppStore;

  /**
   * Initializes the RootStore and instantiates child sub-stores with root references.
   */
  public constructor() {
    this.uiStore = new UIStore(this);
    this.appStore = new AppStore(this);
  }
}

/**
 * Factory function creating a fresh `RootStore` instance (useful for testing and SSR).
 */
export const createRootStore = (): RootStore => new RootStore();

/**
 * Global singleton `RootStore` instance utilized across the React component tree.
 */
export const rootStore = createRootStore();
