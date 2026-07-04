/**
 * Performance monitoring utility for measuring app initialization and navigation transitions.
 */

interface PerformanceMetrics {
  [key: string]: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private startTimes: Record<string, number> = {};

  startMeasure(label: string): void {
    this.startTimes[label] = performance.now();
  }

  endMeasure(label: string): number {
    const startTime = this.startTimes[label];
    if (startTime === undefined) {
      console.warn(`[Performance] No start time found for measure: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics[label] = duration;

    delete this.startTimes[label];
    return duration;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  clearMetrics(): void {
    this.metrics = {};
    this.startTimes = {};
  }

  /**
   * Development/debugging utility: logs performance metrics to console.
   * Note: This is currently development-only. Production telemetry can be added
   * in a future release by wiring logMetrics() output to an analytics backend.
   */
  logMetrics(): void {
    console.log('[Performance Metrics (dev)]', this.metrics);
  }
}

export const perfMonitor = new PerformanceMonitor();
