import { withMiddleware } from '@/lib/middleware';
import { success } from '@/lib/api-response';
import { Logger } from '@/lib/logger';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

export const POST = withMiddleware(async (req) => {
  const body: { events: AnalyticsEvent[] } = await req.json();

  for (const evt of body.events ?? []) {
    Logger.for('analytics').info(evt.event, {
      properties: evt.properties,
      ts: evt.timestamp ?? Date.now(),
    });
  }

  return success({ accepted: body.events?.length ?? 0 });
});
