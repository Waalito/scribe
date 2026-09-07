import type { DocumentContent } from '@/types/document';

export type RunStatus =
  | 'running'
  | 'dead'
  | 'completed';

export interface RunState {
  document: DocumentContent;

  status: RunStatus;

  currentParagraph: number;
  currentLine: number;
  characterIndex: number;

  errors: number;
  totalErrors: number;

  bullets: number;
  corruption: number;
  survivedCount: number;

  timeRemaining: number;
}