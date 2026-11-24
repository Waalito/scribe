import type { RunState } from '@/types/run';

export type CorruptionStage =
  | 'I'
  | 'II'
  | 'III'
  | 'IV'
  | 'V';

/**
 * Corrupción de la run.
 *
 * - Cada error suma +5.
 * - Cada supervivencia suma según la etapa (5 / 5 / 10 / 10 / 15).
 *
 * Etapa 'I' = Stage 0: estado limpio, sin efectos.
 * Etapa 'II' (a partir de 15, o sea con la primera bala) = Stage 1:
 * empiezan la niebla y los efectos.
 */
export class CorruptionSystem {
  static readonly ERROR_INCREASE = 5;

  increaseAfterError(run: RunState): void {
    run.corruption += CorruptionSystem.ERROR_INCREASE;
  }

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

    if (run.corruption >= 15) {
      return 'II';
    }

    return 'I';
  }

  reset(run: RunState): void {
    run.corruption = 0;
  }
}