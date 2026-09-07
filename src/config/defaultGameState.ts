import type { GameState } from '@/types/gameState';

export const defaultGameState: GameState = {
  run: null,
  documentsCompletedThisRun: 0,
  documentsCompletedThisWeek: 0,
};

//Cuando implementemos el sistema de juego, probablemente utilizaremos una función tipo: createInitialGameState()