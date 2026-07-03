import { perfMonitor } from '../utils/performanceMonitor';

describe('PerformanceMonitor', () => {
  let performanceNowSpy: jest.SpyInstance;
  let currentTime = 0;

  beforeEach(() => {
    perfMonitor.clearMetrics();
    currentTime = 0;

    performanceNowSpy = jest.spyOn(performance, 'now').mockImplementation(() => {
      return currentTime;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    performanceNowSpy.mockRestore();
    perfMonitor.clearMetrics();
  });

  it('measures elapsed time between start and end', () => {
    perfMonitor.startMeasure('test-measure');
    currentTime += 100;
    const duration = perfMonitor.endMeasure('test-measure');

    expect(duration).toBeGreaterThanOrEqual(100);
  });

  it('stores measurements in metrics', () => {
    perfMonitor.startMeasure('metric-1');
    currentTime += 50;
    perfMonitor.endMeasure('metric-1');

    const metrics = perfMonitor.getMetrics();
    expect(metrics['metric-1']).toBeGreaterThanOrEqual(50);
  });

  it('clears all metrics when clearMetrics is called', () => {
    perfMonitor.startMeasure('measure-1');
    currentTime += 50;
    perfMonitor.endMeasure('measure-1');

    perfMonitor.clearMetrics();
    const metrics = perfMonitor.getMetrics();
    expect(Object.keys(metrics).length).toBe(0);
  });

  it('warns when ending measure without start', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    perfMonitor.endMeasure('nonexistent');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No start time found')
    );
  });
});
