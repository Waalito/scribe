import type { RunState } from '@/types/run';

import { RunSystem } from '@/systems/run/RunSystem';
import { TimerSystem } from '@/systems/timer/TimerSystem';

export class CheckpointSystem {
  private readonly runSystem: RunSystem;
  private readonly timerSystem: TimerSystem;

  constructor(
    runSystem: RunSystem,
    timerSystem: TimerSystem,
  ) {
    this.runSystem = runSystem;
    this.timerSystem = timerSystem;
  }

  reachCheckpoint(run: RunState): void {
    this.runSystem.reachCheckpoint(run);
    this.timerSystem.reset(run);
  }
}