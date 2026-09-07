export type GameEvent =
  | 'start'
  | 'pause'
  | 'resume'
  | 'save'
  | 'load'
  | 'open_document'
  | 'complete_achievement';

export interface EventPayload {
  event: GameEvent;
  timestamp: string;
  details?: Record<string, unknown>;
}
