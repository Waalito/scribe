import type { DocumentContent } from '@/types/document';
import { DocumentParser } from './DocumentParser';

export class DocumentLoader {
  private readonly parser: DocumentParser;

  constructor() {
    this.parser = new DocumentParser();
  }

  load(markdown: string): DocumentContent {
    return this.parser.parse(markdown);
  }
}