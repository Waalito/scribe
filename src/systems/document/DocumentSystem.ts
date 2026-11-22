
import type { DocumentContent } from '@/types/document';
import { documentConditions } from '@/config/documentConditions';

export class DocumentSystem {
  /**
   * Obtiene los documentos que todavía pueden aparecer
   * en una nueva run.
   *
   * Los documentos conservados quedan excluidos.
   */
  getAvailableDocuments(
    documents: DocumentContent[],
    preservedDocumentIds: Set<string>,
  ): DocumentContent[] {
    return documents.filter(
      (document) =>
        !preservedDocumentIds.has(document.metadata.id),
    );
  }

  /**
   * Comprueba si un documento cumple
   * su condición de conservación.
   */
  canPreserveDocument(
    document: DocumentContent,
    totalErrors: number,
  ): boolean {
    const condition =
      documentConditions[document.metadata.category];

    if (!condition) {
      return false;
    }

    return totalErrors <= condition.maxErrors;
  }

  /**
   * Selecciona un documento aleatorio
   * del conjunto de documentos disponibles.
   */
  selectRandomDocument(
    documents: DocumentContent[],
  ): DocumentContent {
    if (documents.length === 0) {
      throw new Error('No documents available');
    }

    const randomIndex = Math.floor(
      Math.random() * documents.length,
    );

    return documents[randomIndex];
  }
}
