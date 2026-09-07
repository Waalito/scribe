import type {
  DocumentCategory,
  DocumentContent,
  DocumentMetadata,
  DocumentParagraph,
} from '@/types/document';

export class DocumentParser {
  parse(markdown: string): DocumentContent {
    const { metadata, body } = this.extractFrontmatter(markdown);

    return {
      metadata,
      paragraphs: this.parseParagraphs(body),
    };
  }

  private extractFrontmatter(markdown: string): {
    metadata: DocumentMetadata;
    body: string;
  } {
    const frontmatterMatch = markdown.match(
      /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/,
    );

    if (!frontmatterMatch) {
      throw new Error('Invalid document: frontmatter not found');
    }

    const [, rawMetadata, body] = frontmatterMatch;

    const metadata = this.parseMetadata(rawMetadata);

    return {
      metadata,
      body: body.trim(),
    };
  }

  private parseMetadata(rawMetadata: string): DocumentMetadata {
    const metadata: Record<string, string | string[]> = {};

    for (const line of rawMetadata.split('\n')) {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      if (key === 'tags') {
        metadata[key] = [];
        continue;
      }

      metadata[key] = value;
    }

    return {
      id: String(metadata.id ?? ''),
      locale: metadata.locale === 'en' ? 'en' : 'es',
      title: String(metadata.title ?? ''),
      category: this.parseCategory(String(metadata.category ?? '')),
      tags: Array.isArray(metadata.tags) ? metadata.tags : undefined,
    };
  }

  private parseCategory(value: string): DocumentCategory {
    const validCategories: DocumentCategory[] = [
      'poem',
      'letter',
      'historical',
      'tale',
      'knowledge',
      'tongue-twister',
    ];

    if (!validCategories.includes(value as DocumentCategory)) {
      throw new Error(`Invalid document category: ${value}`);
    }

    return value as DocumentCategory;
  }

  private parseParagraphs(body: string): DocumentParagraph[] {
    return body
      .split(/\n\s*\n/)
      .map((paragraph) => {
        const lines = paragraph
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((text) => ({
            text,
          }));

        return {
          lines,
        };
      })
      .filter((paragraph) => paragraph.lines.length > 0);
  }
}