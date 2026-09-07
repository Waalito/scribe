import type { DocumentCategory } from '@/types/document';

export const documentConditions: Partial<
  Record<DocumentCategory, { maxErrors: number }>
> = {
  poem: {
    maxErrors: 1,
  },

  letter: {
    maxErrors: 0,
  },

  historical: {
    maxErrors: 2,
  },

  'tongue-twister': {
    maxErrors: 3,
  },
};