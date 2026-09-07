import type { RunState } from '@/types/run';

export const DOCUMENT_TIME_LIMIT = 300;

export class TimerSystem {
  private readonly timeLimit: number;

  constructor(timeLimit = DOCUMENT_TIME_LIMIT) {
    this.timeLimit = timeLimit;
  }

  initialize(run: RunState): void {
    run.timeRemaining = this.timeLimit;
  }

  reset(run: RunState): void {
    run.timeRemaining = this.timeLimit;
  }

  tick(run: RunState, seconds = 1): void {
    if (run.status !== 'running') {
      return;
    }

    run.timeRemaining = Math.max(
      0,
      run.timeRemaining - seconds,
    );
  }

  isExpired(run: RunState): boolean {
    return run.timeRemaining <= 0;
  }
}