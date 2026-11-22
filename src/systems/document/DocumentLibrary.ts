
import type { DocumentContent } from '@/types/document';

const STORAGE_KEY = 'scribe:document-library:v1';

export class DocumentLibrary {
  private preservedDocuments: Map<string, DocumentContent>;

  constructor() {
    this.preservedDocuments = new Map();
    this.load();
  }

  preserveDocument(document: DocumentContent): void {
    const documentId = document.metadata.id;

    if (this.preservedDocuments.has(documentId)) {
      return;
    }

    this.preservedDocuments.set(documentId, document);
    this.save();
  }

  getPreservedDocuments(): DocumentContent[] {
    return Array.from(this.preservedDocuments.values());
  }

  hasDocument(documentId: string): boolean {
    return this.preservedDocuments.has(documentId);
  }

  getPreservedDocumentIds(): Set<string> {
    return new Set(this.preservedDocuments.keys());
  }

  get size(): number {
    return this.preservedDocuments.size;
  }

  private load(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);

      if (!storedData) {
        return;
      }

      const documents: unknown = JSON.parse(storedData);

      if (!Array.isArray(documents)) {
        return;
      }

      for (const document of documents) {
        if (
          typeof document?.metadata?.id === 'string' &&
          typeof document?.metadata?.title === 'string' &&
          Array.isArray(document?.paragraphs)
        ) {
          this.preservedDocuments.set(
            document.metadata.id,
            document as DocumentContent,
          );
        }
      }
    } catch (error) {
      console.error(
        '[Scribe] Failed to load document library:',
        error,
      );
    }
  }

  private save(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const documents = this.getPreservedDocuments();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(documents),
      );
    } catch (error) {
      console.error(
        '[Scribe] Failed to save document library:',
        error,
      );
    }
  }
}
