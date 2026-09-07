import type { DocumentContent } from '@/types/document';

export interface DocumentResult {
  document: DocumentContent;

  completed: boolean;
  preserved: boolean;

  totalErrors: number;
  survivedCount: number;

  corruption: number;
}