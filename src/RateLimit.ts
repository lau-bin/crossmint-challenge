import { getLogger } from "./Logger";


export class RateLimit {
  private logger = getLogger("rate-limit");
  private queue: Array<[() => void, (value: any) => void, (reason?: any) => void]> = [];
  private waiting = false;
  constructor(
    private delay: number
  ) { }

  updateDelay(delay: number) {
    this.delay = delay;
  }

  async run<T>(callback: (...args: any[]) => T) {
    return new Promise<T>((accept, reject) => {
      if (this.queue.length == 0 && this.waiting == false) {
        try {
          this.logger.debug("Executing callback");
          accept(callback());
        } catch (e) {
          this.logger.debug("Error executing callback");
          reject(e);
        }
        this.waiting = true;
        setTimeout(
          this.process.bind(this),
          this.delay
        )
      } else {
        this.queue.push([callback, accept, reject]);
      }
    })
  }

  private process() {
    if (this.queue.length > 0) {
      const [callback, accept, reject] = this.queue.splice(0, 1)[0];
      try {
        this.logger.debug("Executing callback");
        accept(callback());
      } catch (e) {
        this.logger.debug("Error executing callback");
        reject(e);
      }
      if (this.queue.length > 0) {
        setTimeout(
          this.process.bind(this),
          this.delay
        )
      } else {
        this.waiting = false;
      }
    } else {
      this.waiting = false;
    }
  }
}