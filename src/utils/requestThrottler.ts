export class RequestThrottler {
  private activeRequests = 0;
  private queue: Array<(value?: unknown) => void> = [];
  private concurrencyLimit = 3;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.activeRequests >= this.concurrencyLimit) {
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.activeRequests++;
    try {
      return await fn();
    } finally {
      this.activeRequests--;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

export const wikipediaThrottler = new RequestThrottler();
