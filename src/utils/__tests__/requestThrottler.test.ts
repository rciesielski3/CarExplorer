import { RequestThrottler } from '../requestThrottler';

describe('RequestThrottler', () => {
  it('executes all queued requests, not just concurrencyLimit', async () => {
    const throttler = new RequestThrottler();
    const results: number[] = [];
    const promises: Promise<void>[] = [];

    // Fire 10 concurrent requests with limit of 3
    for (let i = 0; i < 10; i++) {
      promises.push(
        throttler.execute(async () => {
          results.push(i);
          await new Promise(resolve => setTimeout(resolve, 10));
        })
      );
    }

    // All should complete (not hang)
    await Promise.all(promises);

    // All 10 requests should have executed
    expect(results.length).toBe(10);
    expect(results.sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
