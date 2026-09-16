/**
 * Structural interface for the root coordinator store.
 * Allows child sub-stores to reference the root without creating circular file dependencies.
 */
export interface IRootStore {
  /** Reference to the UI store. */
  readonly uiStore: unknown;
  /** Reference to the App store. */
  readonly appStore: unknown;
}
