export const QUEUES = {
  SYSTEM: 'system-queue',
  GAME_EVENTS: 'game-events-queue',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export const JOB_NAMES = {
  CLEANUP: 'system:cleanup',
  HEALTH_CHECK: 'system:health-check',
  REALM_METRICS: 'game:realm-metrics',
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
