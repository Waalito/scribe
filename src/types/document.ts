export type DocumentCategory =
  | 'poem'
  | 'letter'
  | 'historical'
  | 'tale'
  | 'knowledge'
  | 'tongue-twister';

export interface DocumentMetadata {
  id: string;
  locale: 'es' | 'en';
  title: string;
  category: DocumentCategory;
  tags?: string[];
}

export interface DocumentLine {
  text: string;
}

export interface DocumentParagraph {
  lines: DocumentLine[];
}

export interface DocumentContent {
  metadata: DocumentMetadata;
  paragraphs: DocumentParagraph[];
}