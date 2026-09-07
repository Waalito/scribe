import type { RunState } from '@/types/run';

export interface GameState {
  run: RunState | null;

  documentsCompletedThisRun: number;
  documentsCompletedThisWeek: number;
}