// Plays the day across `durationMs`: a playhead that moves 0 -> totalMinutes.
// The clock is injectable so tests can drive time deterministically.

export interface Clock {
  now(): number;
  schedule(cb: () => void): number; // next frame
  cancel(handle: number): void;
}

export const browserClock: Clock = {
  now: () => performance.now(),
  schedule: (cb) => requestAnimationFrame(() => cb()),
  cancel: (h) => cancelAnimationFrame(h),
};

export class Playback {
  minute = 0;
  playing = false;
  private startedAt = 0;
  private startMinute = 0;
  private handle: number | null = null;

  constructor(
    public totalMinutes: number,
    public durationMs: number,
    private onTick: (minute: number, playing: boolean) => void,
    private clock: Clock = browserClock,
  ) {}

  play(): void {
    if (this.playing) return;
    if (this.minute >= this.totalMinutes) this.minute = 0; // replay from the start
    this.playing = true;
    this.startedAt = this.clock.now();
    this.startMinute = this.minute;
    this.loop();
  }

  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    if (this.handle !== null) this.clock.cancel(this.handle);
    this.handle = null;
    this.onTick(this.minute, false);
  }

  toggle(): void {
    if (this.playing) this.pause();
    else this.play();
  }

  /** Jump to a minute; keeps playing from there if playing. */
  seek(minute: number): void {
    this.minute = Math.min(Math.max(minute, 0), this.totalMinutes);
    this.startedAt = this.clock.now();
    this.startMinute = this.minute;
    this.onTick(this.minute, this.playing);
  }

  setDuration(ms: number): void {
    // Re-anchor so the playhead doesn't jump when the speed changes mid-play.
    this.startedAt = this.clock.now();
    this.startMinute = this.minute;
    this.durationMs = Math.max(ms, 1000);
  }

  /** Advance to the clock's current time. Called every frame; public for tests. */
  tick(): void {
    if (!this.playing) return;
    const elapsed = this.clock.now() - this.startedAt;
    const perMs = this.totalMinutes / this.durationMs;
    this.minute = Math.min(this.startMinute + elapsed * perMs, this.totalMinutes);
    if (this.minute >= this.totalMinutes) {
      this.playing = false;
      this.handle = null;
      this.onTick(this.minute, false);
      return;
    }
    this.onTick(this.minute, true);
  }

  private loop(): void {
    this.handle = this.clock.schedule(() => {
      this.tick();
      if (this.playing) this.loop();
    });
  }
}

/** Sends only the latest value, at most once per `intervalMs` (for real-light playback). */
export class LatestThrottle<T> {
  private last = -Infinity;
  private pending: { value: T } | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private intervalMs: number,
    private send: (value: T) => void,
    private now: () => number = () => Date.now(),
    // Wrapped, not bare `setTimeout`: called as this.setTimer(...), a bare browser
    // setTimeout gets the wrong `this` and throws "Illegal invocation".
    private setTimer: (cb: () => void, ms: number) => ReturnType<typeof setTimeout> = (cb, ms) => setTimeout(cb, ms),
    private clearTimer: (t: ReturnType<typeof setTimeout>) => void = (t) => clearTimeout(t),
  ) {}

  push(value: T): void {
    const wait = this.last + this.intervalMs - this.now();
    if (wait <= 0) {
      this.fire(value);
      return;
    }
    this.pending = { value };
    if (this.timer === null) {
      this.timer = this.setTimer(() => {
        this.timer = null;
        const p = this.pending;
        this.pending = null;
        if (p) this.fire(p.value);
      }, wait);
    }
  }

  cancel(): void {
    if (this.timer !== null) this.clearTimer(this.timer);
    this.timer = null;
    this.pending = null;
  }

  private fire(value: T): void {
    this.last = this.now();
    this.send(value);
  }
}
