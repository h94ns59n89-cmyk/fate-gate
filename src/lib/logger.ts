type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  trace_id?: string;
  span_id?: string;
  [key: string]: unknown;
}

export class Logger {
  private trace?: { traceId: string; spanId?: string };
  private service: string;

  private constructor(service: string, trace?: { traceId: string; spanId?: string }) {
    this.service = service;
    if (trace) this.trace = trace;
  }

  static for(service: string, trace?: { traceId: string; spanId?: string }): Logger {
    return new Logger(service, trace);
  }

  withTrace(trace: { traceId: string; spanId?: string }): Logger {
    return new Logger(this.service, trace);
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    this.write('debug', message, extra);
  }

  info(message: string, extra?: Record<string, unknown>): void {
    this.write('info', message, extra);
  }

  warn(message: string, extra?: Record<string, unknown>): void {
    this.write('warn', message, extra);
  }

  error(message: string, extra?: Record<string, unknown>): void {
    this.write('error', message, extra);
  }

  private write(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      ...(this.trace ? { trace_id: this.trace.traceId, span_id: this.trace.spanId } : {}),
      ...extra,
    };

    const output = JSON.stringify(entry);
    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }
}
