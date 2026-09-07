import type { DocumentContent } from '@/types/document';
import { DocumentLoader } from '@/systems/document/DocumentLoader';

const documentFiles = import.meta.glob(
  '../documents/**/*.md',
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
);

const loader = new DocumentLoader();

export const documents: DocumentContent[] = Object.values(documentFiles).map(
  (markdown) => loader.load(markdown),
);