
import { DocumentLibrary } from './DocumentLibrary';
import type { DocumentContent } from '@/types/document';

const library = new DocumentLibrary();

// Documento de prueba
const testDocument: DocumentContent = {
  metadata: {
    id: 'test-poem-001',
    locale: 'es',
    title: 'El último invierno',
    category: 'poem',
    tags: ['test'],
  },
  paragraphs: [
    {
      lines: [
        { text: 'El invierno nunca termina.' },
        { text: 'La piedra recuerda.' },
      ],
    },
  ],
};

// 1. Registrar documento
library.preserveDocument(testDocument);

console.assert(
  library.size === 1,
  'ERROR: El documento no fue registrado.',
);

// 2. Intentar registrar el mismo documento
library.preserveDocument(testDocument);

console.assert(
  library.size === 1,
  'ERROR: Se registró un documento duplicado.',
);

// 3. Consultar documentos
const documents = library.getPreservedDocuments();

console.assert(
  documents.length === 1,
  'ERROR: La biblioteca devuelve una cantidad incorrecta.',
);

// 4. Comprobar existencia
console.assert(
  library.hasDocument('test-poem-001'),
  'ERROR: No se encontró el documento.',
);

// 5. Consultar identificadores
const ids = library.getPreservedDocumentIds();

console.assert(
  ids.has('test-poem-001'),
  'ERROR: No se encontró el identificador.',
);

// Resultado
console.log('DocumentLibrary:', {
  totalDocuments: library.size,
  documents,
  ids: [...ids],
});

console.log('Pruebas de DocumentLibrary finalizadas.');
