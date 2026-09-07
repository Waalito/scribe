import type { RunState } from '@/types/run';

export type TypingResult =
  | 'correct'
  | 'error'
  | 'line-complete'
  | 'paragraph-complete'
  | 'document-complete';

export class TypingSystem {
  getCurrentLine(run: RunState): string {
    const paragraph =
      run.document.paragraphs[run.currentParagraph];

    if (!paragraph) {
      return '';
    }

    const line =
      paragraph.lines[run.currentLine];

    if (!line) {
      return '';
    }

    return line.text;
  }

  isLineComplete(run: RunState): boolean {
    const currentLine = this.getCurrentLine(run);

    return run.characterIndex >= currentLine.length;
  }

  processCharacter(
    run: RunState,
    character: string,
  ): TypingResult {
    const currentLine = this.getCurrentLine(run);

    const expectedCharacter =
      currentLine[run.characterIndex];

    if (character !== expectedCharacter) {
      run.errors += 1;
      run.totalErrors += 1;

      run.characterIndex = 0;

      return 'error';
    }

    run.characterIndex += 1;

    if (!this.isLineComplete(run)) {
      return 'correct';
    }

    const paragraph =
      run.document.paragraphs[run.currentParagraph];

    if (!paragraph) {
      return 'correct';
    }

    const isLastLineInParagraph =
      run.currentLine >=
      paragraph.lines.length - 1;

    if (!isLastLineInParagraph) {
      return 'line-complete';
    }

    const isLastParagraph =
      run.currentParagraph >=
      run.document.paragraphs.length - 1;

    if (isLastParagraph) {
      return 'document-complete';
    }

    return 'paragraph-complete';
  }
}