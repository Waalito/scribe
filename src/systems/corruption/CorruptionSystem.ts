import type { RunState } from '@/types/run';

export type CorruptionStage =
  | 'I'
  | 'II'
  | 'III'
  | 'IV'
  | 'V';

export class CorruptionSystem {
  increaseAfterSurvival(run: RunState): void {
    const stage = this.getStage(run);

    switch (stage) {
      case 'I':
        run.corruption += 5;
        break;

      case 'II':
        run.corruption += 5;
        break;

      case 'III':
        run.corruption += 10;
        break;

      case 'IV':
        run.corruption += 10;
        break;

      case 'V':
        run.corruption += 15;
        break;
    }
  }

  getStage(run: RunState): CorruptionStage {
    if (run.corruption >= 70) {
      return 'V';
    }

    if (run.corruption >= 45) {
      return 'IV';
    }

    if (run.corruption >= 25) {
      return 'III';
    }

    if (run.corruption >= 10) {
      return 'II';
    }

    return 'I';
  }

  reset(run: RunState): void {
    run.corruption = 0;
  }
}