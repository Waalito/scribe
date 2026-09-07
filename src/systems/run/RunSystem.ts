import type { DocumentContent } from '@/types/document';
import type { RunState } from '@/types/run';

export class RunSystem {
  createRun(document: DocumentContent): RunState {
    return {
      document,

      status: 'running',

      currentParagraph: 0,
      currentLine: 0,
      characterIndex: 0,

      errors: 0,
      totalErrors: 0,

      bullets: 0,
      corruption: 0,
      survivedCount: 0,

      timeRemaining: 0,
    };
  }

  markDead(run: RunState): void {
    run.status = 'dead';
  }

  markCompleted(run: RunState): void {
    run.status = 'completed';
  }

  registerError(run: RunState): void {
    run.errors += 1;
    run.totalErrors += 1;
  }

  resetErrors(run: RunState): void {
    run.errors = 0;
  }

  reachCheckpoint(run: RunState): void {
    run.errors = 0;
    run.bullets = 0;
  }

  advanceLine(run: RunState): void {
    const paragraph =
      run.document.paragraphs[run.currentParagraph];

    if (!paragraph) {
      return;
    }

    const isLastLine =
      run.currentLine >= paragraph.lines.length - 1;

    if (!isLastLine) {
      run.currentLine += 1;
      run.characterIndex = 0;
      return;
    }

    if (
      run.currentParagraph <
      run.document.paragraphs.length - 1
    ) {
      run.currentParagraph += 1;
      run.currentLine = 0;
      run.characterIndex = 0;
    }
  }

  isParagraphComplete(run: RunState): boolean {
    const paragraph =
      run.document.paragraphs[run.currentParagraph];

    if (!paragraph) {
      return false;
    }

    const lastLineIndex =
      paragraph.lines.length - 1;

    const lastLine =
      paragraph.lines[lastLineIndex];

    if (!lastLine) {
      return false;
    }

    return (
      run.currentLine === lastLineIndex &&
      run.characterIndex >= lastLine.text.length
    );
  }

  isDocumentComplete(run: RunState): boolean {
    const lastParagraphIndex =
      run.document.paragraphs.length - 1;

    const lastParagraph =
      run.document.paragraphs[lastParagraphIndex];

    if (!lastParagraph) {
      return false;
    }

    const lastLineIndex =
      lastParagraph.lines.length - 1;

    const lastLine =
      lastParagraph.lines[lastLineIndex];

    if (!lastLine) {
      return false;
    }

    return (
      run.currentParagraph === lastParagraphIndex &&
      run.currentLine === lastLineIndex &&
      run.characterIndex >= lastLine.text.length
    );
  }
}