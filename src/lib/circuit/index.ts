enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

interface CircuitConfig {
  failureThreshold: number;
  successThreshold: number;
  openTimeoutMs: number;
  halfOpenMaxRequests: number;
}

interface CircuitStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChangeTime: number;
}

const circuits = new Map<string, CircuitStats>();

function defaultConfig(service: string): CircuitConfig {
  switch (service) {
    case 'gpt-api':
      return {
        failureThreshold: 5,
        successThreshold: 3,
        openTimeoutMs: 30000,
        halfOpenMaxRequests: 3,
      };
    case 'deepseek-api':
      return {
        failureThreshold: 3,
        successThreshold: 2,
        openTimeoutMs: 15000,
        halfOpenMaxRequests: 2,
      };
    case 'bazi-engine':
      return {
        failureThreshold: 5,
        successThreshold: 2,
        openTimeoutMs: 10000,
        halfOpenMaxRequests: 2,
      };
    default:
      return {
        failureThreshold: 5,
        successThreshold: 3,
        openTimeoutMs: 30000,
        halfOpenMaxRequests: 3,
      };
  }
}

function getStats(service: string): CircuitStats {
  if (!circuits.has(service)) {
    circuits.set(service, {
      state: CircuitState.CLOSED,
      failureCount: 0,
      successCount: 0,
      lastFailureTime: 0,
      lastStateChangeTime: Date.now(),
    });
  }
  return circuits.get(service)!;
}

export function checkCircuit(service: string): boolean {
  const stats = getStats(service);
  const config = defaultConfig(service);

  if (stats.state === CircuitState.CLOSED) {
    return true;
  }

  if (stats.state === CircuitState.OPEN) {
    if (Date.now() - stats.lastStateChangeTime >= config.openTimeoutMs) {
      stats.state = CircuitState.HALF_OPEN;
      stats.successCount = 0;
      stats.lastStateChangeTime = Date.now();
      return true;
    }
    return false;
  }

  if (stats.state === CircuitState.HALF_OPEN) {
    return stats.successCount < config.halfOpenMaxRequests;
  }

  return true;
}

export function recordSuccess(service: string): void {
  const stats = getStats(service);
  const config = defaultConfig(service);

  if (stats.state === CircuitState.HALF_OPEN) {
    stats.successCount++;
    if (stats.successCount >= config.successThreshold) {
      stats.state = CircuitState.CLOSED;
      stats.failureCount = 0;
      stats.successCount = 0;
      stats.lastStateChangeTime = Date.now();
    }
  }

  if (stats.state === CircuitState.CLOSED) {
    stats.failureCount = 0;
  }
}

export function recordFailure(service: string): void {
  const stats = getStats(service);
  const config = defaultConfig(service);

  stats.failureCount++;
  stats.lastFailureTime = Date.now();

  if (stats.state === CircuitState.CLOSED && stats.failureCount >= config.failureThreshold) {
    stats.state = CircuitState.OPEN;
    stats.lastStateChangeTime = Date.now();
  }

  if (stats.state === CircuitState.HALF_OPEN) {
    stats.state = CircuitState.OPEN;
    stats.lastStateChangeTime = Date.now();
  }
}

export function getCircuitState(service: string): string {
  const stats = getStats(service);
  return CircuitState[stats.state] ?? 'UNKNOWN';
}

export function resetCircuit(service: string): void {
  circuits.delete(service);
}
