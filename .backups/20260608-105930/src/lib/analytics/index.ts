export const EVENTS = {
  LANDING_VIEW: 'landing_view',
  FORM_START: 'form_start',
  FORM_COMPLETE: 'form_complete',
  TIME_UNKNOWN: 'time_unknown',
  SUMMARY_GENERATED: 'summary_generated',
  SUMMARY_SHARED: 'summary_shared',
  TAG_CLICKED: 'tag_clicked',
  PAY_CLICKED: 'pay_clicked',
  PAY_SUCCESS: 'pay_success',
  PAY_FAILED: 'pay_failed',
  REPORT_VIEWED: 'report_viewed',
  COMPARISON_CREATED: 'comparison_created',
  USER_RETURN: 'user_return',
  SUBSCRIPTION_STARTED: 'subscription_started',
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];

interface AnalyticsEvent {
  event: EventName;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('user_id');
  } catch {
    return null;
  }
}

export function trackEvent(
  event: EventName,
  properties?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return;

  const payload: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      session_id: getSessionId(),
    },
    timestamp: Date.now(),
  };

  const userId = getUserId();
  if (userId) {
    payload.properties = { ...payload.properties, user_id: userId };
  }

  try {
    const queue = JSON.parse(sessionStorage.getItem('analytics_queue') ?? '[]');
    queue.push(payload);
    sessionStorage.setItem('analytics_queue', JSON.stringify(queue));

    if (queue.length >= 5) {
      flushEvents();
    }
  } catch {
    // Silently fail analytics
  }
}

export function flushEvents(): void {
  if (typeof window === 'undefined') return;

  try {
    const queue = JSON.parse(sessionStorage.getItem('analytics_queue') ?? '[]');
    if (queue.length === 0) return;

    const body = JSON.stringify({ events: queue });
    navigator.sendBeacon?.('/api/v1/analytics/events', body);

    sessionStorage.setItem('analytics_queue', '[]');
  } catch {
    // Silently fail
  }
}

export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeunload', () => flushEvents());
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushEvents();
  });
}
