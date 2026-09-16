import { makeAutoObservable } from 'mobx';
import type { IRootStore } from './root.store.interface';

/**
 * Visual themes supported by the application design system.
 */
export type AppTheme = 'atiesh' | 'dark' | 'light';

/**
 * Toast notification payload managed in the UI state.
 */
export interface ToastNotification {
  /** Unique notification identifier. */
  id: string;
  /** Notification message content. */
  message: string;
  /** Toast severity/variant. */
  type: 'info' | 'success' | 'warning' | 'error';
  /** Optional correlation ID for tracing server errors. */
  correlationId?: string;
}

/**
 * MobX sub-store for managing user interface state (theme, sidebar drawer, active notifications).
 */
export class UIStore {
  /** Current active UI theme. */
  public theme: AppTheme = 'atiesh';
  /** Whether the responsive navigation sidebar is currently open. */
  public isSidebarOpen = false;
  /** List of active toast notifications queued for display. */
  public notifications: ToastNotification[] = [];

  private readonly rootStore: IRootStore;

  /**
   * Constructs an instance of `UIStore`.
   *
   * @param rootStore - Parent RootStore coordinator.
   */
  public constructor(rootStore: IRootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /**
   * Total number of active notifications.
   */
  public get activeNotificationCount(): number {
    return this.notifications.length;
  }

  /**
   * Evaluates if the current theme is a dark variant.
   */
  public get isDarkMode(): boolean {
    return this.theme === 'dark' || this.theme === 'atiesh';
  }

  /**
   * Updates the application theme.
   *
   * @param theme - Target theme variant (`atiesh`, `dark`, `light`).
   */
  public setTheme(theme: AppTheme): void {
    this.theme = theme;
  }

  /**
   * Toggles the sidebar open/closed state.
   */
  public toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  /**
   * Sets explicit sidebar open state.
   *
   * @param isOpen - Desired open state.
   */
  public setSidebarOpen(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  /**
   * Queues a new toast notification.
   *
   * @param notification - Notification parameters (id is generated if omitted).
   * @returns Notification ID.
   */
  public addNotification(notification: Omit<ToastNotification, 'id'> & { id?: string }): string {
    const id = notification.id ?? `notify-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newNotification: ToastNotification = {
      id,
      message: notification.message,
      type: notification.type,
      ...(notification.correlationId ? { correlationId: notification.correlationId } : {}),
    };
    this.notifications.push(newNotification);
    return id;
  }

  /**
   * Dismisses a specific notification by ID.
   *
   * @param id - ID of the notification to remove.
   */
  public removeNotification(id: string): void {
    this.notifications = this.notifications.filter((item) => item.id !== id);
  }

  /**
   * Clears all active notifications.
   */
  public clearNotifications(): void {
    this.notifications = [];
  }

  /**
   * Retrieves reference to the parent RootStore.
   */
  public getRootStore(): IRootStore {
    return this.rootStore;
  }
}
