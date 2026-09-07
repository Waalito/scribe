import type { DocumentContent } from '@/types/document';

export class DocumentSystem {
  selectRandomDocument(
    documents: DocumentContent[],
  ): DocumentContent {
    if (documents.length === 0) {
      throw new Error('No documents available');
    }

    const randomIndex = Math.floor(Math.random() * documents.length);

    return documents[randomIndex];
  }
}