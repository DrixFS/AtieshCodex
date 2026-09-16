import { makeAutoObservable } from 'mobx';
import type { IRootStore } from './root.store.interface';

/**
 * Network connectivity states for the browser application.
 */
export type NetworkStatus = 'online' | 'offline';

/**
 * MobX sub-store for application runtime lifecycle, online/offline status, and backend connectivity heartbeats.
 */
export class AppStore {
  /** Whether the frontend application has completed bootstrapping. */
  public isInitialized = false;
  /** Current browser network connectivity status. */
  public networkStatus: NetworkStatus = 'online';
  /** Epoch millisecond timestamp of the last successful server ping. */
  public lastPingTimestamp: number | null = null;
  /** Correlation ID returned by the most recent ping request. */
  public lastPingCorrelationId: string | null = null;

  private readonly rootStore: IRootStore;

  /**
   * Constructs an instance of `AppStore`.
   *
   * @param rootStore - Parent RootStore coordinator.
   */
  public constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /**
   * Computed flag indicating whether the app is fully initialized and online.
   */
  public get isReady(): boolean {
    return this.isInitialized && this.networkStatus === 'online';
  }

  /**
   * Updates application initialized status.
   *
   * @param initialized - New initialization state.
   */
  public setInitialized(initialized: boolean): void {
    this.isInitialized = initialized;
  }

  /**
   * Updates browser network status.
   *
   * @param status - `online` or `offline`.
   */
  public setNetworkStatus(status: NetworkStatus): void {
    this.networkStatus = status;
  }

  /**
   * Records a heartbeat ping timestamp and associated correlation ID.
   *
   * @param timestamp - Timestamp in milliseconds.
   * @param correlationId - Optional correlation ID returned by the server.
   */
  public recordPing(timestamp: number = Date.now(), correlationId?: string): void {
    this.lastPingTimestamp = timestamp;
    if (correlationId !== undefined) {
      this.lastPingCorrelationId = correlationId;
    }
  }

  /**
   * Resets the store back to initial default values.
   */
  public reset(): void {
    this.isInitialized = false;
    this.networkStatus = 'online';
    this.lastPingTimestamp = null;
    this.lastPingCorrelationId = null;
  }

  /**
   * Retrieves reference to the parent RootStore.
   */
  public getRootStore(): IRootStore {
    return this.rootStore;
  }
}
