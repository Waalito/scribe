import type { DocumentContent } from "../types/document";
import { DocumentSystem } from "../systems/document/DocumentSystem";
import { RunCoordinator } from "../systems/run/RunCoordinator";
import { GameLoop } from "../systems/core/GameLoop";

/* ============================================================
   TYPES
============================================================ */

interface FlatLine {
  paragraphIndex: number;
  lineIndex: number;
  text: string;
}

/* ============================================================
   CONFIGURATION
============================================================ */

/**
 * Número de líneas que forman la ventana narrativa.
 *
 * 3 = anterior / ACTUAL / siguiente
 *
 * La ventana visual NO cambia de tamaño.
 * Lo único que cambia es qué líneas se encuentran dentro.
 */
const VISIBLE_LINES = 3;

/**
 * Altura base de una línea.
 *
 * Debe coincidir con el line-height de Game.astro.
 */
const LINE_HEIGHT = 24;

/**
 * Separación visual entre párrafos.
 *
 * Este valor crea el pequeño "checkpoint" narrativo
 * cuando el jugador entra en un nuevo párrafo.
 */
const PARAGRAPH_GAP = 56;


/* ============================================================
   INITIALIZE GAME
============================================================ */

export function initializeGame(): void {
  console.log("[Scribe] Game initialized");

  /* ==========================================================
     DOM: GAME CONTAINER
  ========================================================== */
  const game = document.getElementById("scribe-game");
  if (!(game instanceof HTMLElement)) {
    throw new Error("[Scribe] Game container not found");
  }

  /* ==========================================================
     DOCUMENT DATA
  ========================================================== */
  const documentDataElement = document.getElementById("game-document-data");
  if (!(documentDataElement instanceof HTMLScriptElement)) {
    throw new Error("[Scribe] Game document data not found");
  }

  let documents: DocumentContent[];
  try {
    documents = JSON.parse(
      documentDataElement.textContent ?? ""
    ) as DocumentContent[];
  } catch (error) {
    console.error("[Scribe] Invalid document data:", error);
    throw new Error("[Scribe] Could not parse document data");
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error("[Scribe] No documents available");
  }
  console.log("[Scribe] Documents available:", documents.length);

  /* ==========================================================
     DOM: UI ELEMENTS
  ========================================================== */
  const documentTitle = document.getElementById("document-title");
  const documentContainer = document.getElementById("document-container");
  const status = document.getElementById("run-status");
  const time = document.getElementById("run-time");
  const currentLine = document.getElementById("current-line");
  const characterProgress = document.getElementById("character-progress");
  const errors = document.getElementById("run-errors");
  const totalErrors = document.getElementById("run-total-errors");
  const bullets = document.getElementById("run-bullets");
  const survived = document.getElementById("run-survived");
  const corruption = document.getElementById("run-corruption");
  const corruptionStage = document.getElementById("corruption-stage");
  const lastAction = document.getElementById("last-action");
  const message = document.getElementById("game-message");
  const deathScreen = document.getElementById("death-screen");
  const completionScreen = document.getElementById("completion-screen");

  const revolver = document.querySelector('#revolver');
  const errorCounter = document.getElementById("error-counter");

if (
  !(documentTitle instanceof HTMLElement) ||
  !(documentContainer instanceof HTMLElement) ||
  !(status instanceof HTMLElement) ||
  !(time instanceof HTMLElement) ||
  !(currentLine instanceof HTMLElement) ||
  !(characterProgress instanceof HTMLElement) ||
  !(errors instanceof HTMLElement) ||
  !(errorCounter instanceof HTMLElement) ||
  !(totalErrors instanceof HTMLElement) ||
  !(bullets instanceof HTMLElement) ||
  !(survived instanceof HTMLElement) ||
  !(corruption instanceof HTMLElement) ||
  !(corruptionStage instanceof HTMLElement) ||
  !(lastAction instanceof HTMLElement) ||
  !(message instanceof HTMLElement) ||
  !(deathScreen instanceof HTMLElement) ||
  !(completionScreen instanceof HTMLElement)
) {
  throw new Error("[Scribe] Game UI elements not found");
}


  /* ==========================================================
     VIEWPORT CONFIGURATION
  ========================================================== */
  /**
   * Estas variables sirven como configuración compartida
   * entre TypeScript y CSS.
   *
   * IMPORTANTE:
   * No calculamos el tamaño según el documento.
   *
   */
  documentContainer.style.setProperty("--scribe-line-height", `${LINE_HEIGHT}px`);
  documentContainer.style.setProperty("--scribe-paragraph-gap", `${PARAGRAPH_GAP}px`);
  documentContainer.style.setProperty("--scribe-visible-lines", String(VISIBLE_LINES));


  /* ==========================================================
     STATE & SYSTEMS
  ========================================================== */
  const documentSystem = new DocumentSystem();
  const coordinator = new RunCoordinator(300);

  let currentDocument: DocumentContent;
  let run: ReturnType<RunCoordinator["createRun"]>;
  let flatLines: FlatLine[] = [];

  /* ==========================================================
     VISUAL ERROR STATE
  ========================================================== */
  let errorParagraph: number | null = null;
  let errorLine: number | null = null;
  let errorCharacter: number | null = null;

  let displayedErrors = 0;

let errorCounterTimeout: number | null = null;

const ERROR_DISPLAY_DURATION = 500;

  /* ==========================================================
     RENDER CACHE
  ========================================================== */
  let renderedStart = -1;
  let renderedEnd = -1;
  let renderedParagraph = -1;
  let renderedLine = -1;
  let renderedCharacter = -1;


  /* ============================================================
   REVOLVER PRESENTATION
============================================================ */

let revolverAnimating = false;
const REVOLVER_SPIN_DURATION = 3000;

  /* ==========================================================
     SCREEN RUN & DEAD 
  ========================================================== */

function updateEndScreens(): void {
  const isDead =
    run.status === "dead" &&
    !revolverAnimating;

  const isCompleted =
    run.status === "completed";

  deathScreen.classList.toggle(
    "is-visible",
    isDead
  );

  completionScreen.classList.toggle(
    "is-visible",
    isCompleted
  );

  deathScreen.setAttribute(
    "aria-hidden",
    String(!isDead)
  );

  completionScreen.setAttribute(
    "aria-hidden",
    String(!isCompleted)
  );
}

/* ============================================================
   REVOLVER
============================================================ */

function getRevolverChambers(): SVGGElement[] {
  if (!(revolver instanceof SVGElement)) {
    return [];
  }

  return Array.from(
    revolver.querySelectorAll<SVGGElement>(".revolver-chamber")
  );
}

function getLoadedChambers(): SVGGElement[] {
  return getRevolverChambers().filter((chamber) => {
    const bullet = chamber.querySelector(".revolver-bullet");

    return bullet?.classList.contains("is-loaded") ?? false;
  });
}

function getEmptyChambers(): SVGGElement[] {
  return getRevolverChambers().filter((chamber) => {
    const bullet = chamber.querySelector(".revolver-bullet");

    return bullet ? !bullet.classList.contains("is-loaded") : false;
  });
}

function getRandomChamber(chambers: SVGGElement[]): number | null {
  if (chambers.length === 0) {
    return null;
  }

  const chamber =
    chambers[Math.floor(Math.random() * chambers.length)];

  const chamberIndex = Number(chamber.dataset.chamber);

  return Number.isInteger(chamberIndex) ? chamberIndex : null;
}

function loadRandomBullet(): number | null {
  const emptyChambers = getEmptyChambers();

  const chamber = getRandomChamber(emptyChambers);

  if (chamber === null) {
    return null;
  }

  revolver?.dispatchEvent(
    new CustomEvent("revolver:load", {
      detail: {
        chamber,
      },
    })
  );

  return chamber;
}

function spinRevolver(
  result: "survived" | "dead"
): void {
  if (!(revolver instanceof SVGElement)) {
    return;
  }

  /**
   * Primero colocamos visualmente la nueva bala.
   *
   * WeaponSystem ya decidió el resultado.
   * Nosotros solamente construimos su representación visual.
   */
  loadRandomBullet();

  const targetChambers =
    result === "dead"
      ? getLoadedChambers()
      : getEmptyChambers();

  const targetChamber =
    getRandomChamber(targetChambers);

  if (targetChamber === null) {
    return;
  }

  revolverAnimating = true;

  revolver.dispatchEvent(
    new CustomEvent("revolver:spin", {
      detail: {
        chamber: targetChamber,
      },
    })
  );

  window.setTimeout(() => {
    revolverAnimating = false;

    updateEndScreens();
  }, REVOLVER_SPIN_DURATION);
}

function resetRevolver(): void {
  if (!(revolver instanceof SVGElement)) {
    return;
  }

  revolver.dispatchEvent(
    new CustomEvent("revolver:reset")
  );

  revolverAnimating = false;
}

  /* ============================================================
     HELPER FUNCTIONS
  ============================================================ */

  /**
   * Convierte todos los párrafos del documento en una única lista lineal.
   *
   * Esto permite trabajar con una ventana narrativa continua
   * independientemente de la estructura interna del documento.
   */
  function flattenDocument(documentData: DocumentContent): FlatLine[] {
    const result: FlatLine[] = [];
    documentData.paragraphs.forEach((paragraph, paragraphIndex) => {
      paragraph.lines.forEach((line, lineIndex) => {
        result.push({ paragraphIndex, lineIndex, text: line.text });
      });
    });
    return result;
  }

  /**
   * Selecciona un documento evitando repetir inmediatamente el documento anterior.
   */
  function selectDocument(previousDocument?: DocumentContent): DocumentContent {
    if (documents.length === 1) {
      return documents[0];
    }
    const availableDocuments = previousDocument
      ? documents.filter((doc) => doc.metadata.id !== previousDocument.metadata.id)
      : documents;
    return documentSystem.selectRandomDocument(availableDocuments);
  }

  /**
   * Devuelve la posición lineal de la línea actual.
   */
  function getCurrentFlatIndex(): number {
    return flatLines.findIndex(
      (line) =>
        line.paragraphIndex === run.currentParagraph &&
        line.lineIndex === run.currentLine
    );
  }

  /**
   * Calcula qué líneas deben existir dentro de la ventana.
   *
   * Con VISIBLE_LINES = 3:
   *   anterior / ACTUAL / siguiente
   *
   * La cantidad de líneas renderizadas permanece constante
   * siempre que el documento tenga suficientes líneas.
   *
   * El viewport NO cambia de tamaño.
   */
  function getRenderRange(): { start: number; end: number } {
    const currentIndex = getCurrentFlatIndex();
    if (currentIndex === -1) {
      return { start: 0, end: Math.min(VISIBLE_LINES, flatLines.length) };
    }

    const linesBefore = Math.floor(VISIBLE_LINES / 2);
    const linesAfter = VISIBLE_LINES - linesBefore - 1;
    let start = currentIndex - linesBefore;
    let end = currentIndex + linesAfter + 1;

    /* --------------------------------------------------------
       LÍMITE SUPERIOR
    -------------------------------------------------------- */
    if (start < 0) {
      start = 0;
      end = Math.min(VISIBLE_LINES, flatLines.length);
    }

    /* --------------------------------------------------------
       LÍMITE INFERIOR
    -------------------------------------------------------- */
    if (end > flatLines.length) {
      end = flatLines.length;
      start = Math.max(0, end - VISIBLE_LINES);
    }

    return { start, end };
  }

  /**
   * Determina si un carácter ya fue escrito.
   */
  function isCharacterTyped(flatLine: FlatLine, characterIndex: number): boolean {
    /* --------------------------------------------------------
       PÁRRAFOS ANTERIORES
    -------------------------------------------------------- */
    if (flatLine.paragraphIndex < run.currentParagraph) {
      return true;
    }

    /* --------------------------------------------------------
       LÍNEAS ANTERIORES DEL MISMO PÁRRAFO
    -------------------------------------------------------- */
    if (
      flatLine.paragraphIndex === run.currentParagraph &&
      flatLine.lineIndex < run.currentLine
    ) {
      return true;
    }

    /* --------------------------------------------------------
       CARACTERES ANTERIORES DE LA LÍNEA ACTUAL
    -------------------------------------------------------- */
    if (
      flatLine.paragraphIndex === run.currentParagraph &&
      flatLine.lineIndex === run.currentLine &&
      characterIndex < run.characterIndex
    ) {
      return true;
    }

    return false;
  }

  /**
   * Crea un carácter individual del documento.
   */
  function createCharacterElement(
    character: string,
    characterIndex: number,
    flatLine: FlatLine
  ): HTMLSpanElement {
    const characterElement = document.createElement("span");
    characterElement.className = "document-character";
    characterElement.dataset.character = String(characterIndex);

    /**
     * Utilizamos NBSP para preservar visualmente
     * los espacios del documento.
     */
    characterElement.textContent = character === " " ? "\u00A0" : character;

    if (isCharacterTyped(flatLine, characterIndex)) {
      characterElement.classList.add("is-typed");
    }

    /**
     * Marca física del error.
     *
     * No cambiamos la estructura del documento.
     * Simplemente marcamos el carácter concreto.
     */
    if (
      flatLine.paragraphIndex === errorParagraph &&
      flatLine.lineIndex === errorLine &&
      characterIndex === errorCharacter
    ) {
      characterElement.classList.add("is-error");
    }

    return characterElement;
  }

  /**
   * Crea una línea completa.
   */
  function createLineElement(flatLine: FlatLine, flatIndex: number): HTMLElement {
    const lineElement = document.createElement("div");
    lineElement.className = "document-line";
    lineElement.dataset.paragraph = String(flatLine.paragraphIndex);
    lineElement.dataset.line = String(flatLine.lineIndex);
    lineElement.dataset.flatIndex = String(flatIndex);

    /**
     * Marca el inicio de un párrafo.
     *
     * El espacio se conserva como recurso narrativo.
     * NO afecta al tamaño del viewport.
     */
    if (flatLine.lineIndex === 0) {
      lineElement.classList.add("is-paragraph-start");
    }

    /* --------------------------------------------------------
       CURRENT LINE
    -------------------------------------------------------- */
    const isCurrent =
      flatLine.paragraphIndex === run.currentParagraph &&
      flatLine.lineIndex === run.currentLine;

    if (isCurrent) {
      lineElement.classList.add("is-current");
    }

    /* --------------------------------------------------------
       PREVIOUS / NEXT
    -------------------------------------------------------- */
    const currentIndex = getCurrentFlatIndex();
    if (flatIndex < currentIndex) {
      lineElement.classList.add("is-previous");
    } else if (flatIndex > currentIndex) {
      lineElement.classList.add("is-next");
    }

    /* --------------------------------------------------------
       CHARACTERS
    -------------------------------------------------------- */
    Array.from(flatLine.text).forEach((character, characterIndex) => {
      lineElement.appendChild(
        createCharacterElement(character, characterIndex, flatLine)
      );
    });

    return lineElement;
  }

  /**
   * Ejecuta la animación cinematográfica de desplazamiento.
   *
   * IMPORTANTE:
   * Esta animación mueve el DOCUMENTO,
   * no modifica el tamaño del viewport.
   */
  function animateDocumentShift(): void {
    documentContainer.classList.remove("is-shifting");
    /**
     * Forzamos reflow para reiniciar
     * correctamente la animación CSS.
     */
    void documentContainer.offsetWidth;
    documentContainer.classList.add("is-shifting");
  }

  /**
   * Renderiza únicamente la ventana narrativa.
   *
   * No se renderiza el documento completo.
   */
  function renderDocumentWindow(force = false): void {
    const { start, end } = getRenderRange();
    const currentParagraph = run.currentParagraph;
    const currentLineIndex = run.currentLine;
    const currentCharacter = run.characterIndex;

    const hasChanged =
      renderedStart !== start ||
      renderedEnd !== end ||
      renderedParagraph !== currentParagraph ||
      renderedLine !== currentLineIndex ||
      renderedCharacter !== currentCharacter;

    if (!force && !hasChanged) {
      return;
    }

    const previousStart = renderedStart;

    /* --------------------------------------------------------
       RENDER DOM
    -------------------------------------------------------- */
    documentContainer.replaceChildren();
    for (let index = start; index < end; index++) {
      const flatLine = flatLines[index];
      if (!flatLine) {
        continue;
      }
      const lineElement = createLineElement(flatLine, index);
      documentContainer.appendChild(lineElement);
    }

    /* --------------------------------------------------------
       UPDATE CACHE
    -------------------------------------------------------- */
    renderedStart = start;
    renderedEnd = end;
    renderedParagraph = currentParagraph;
    renderedLine = currentLineIndex;
    renderedCharacter = currentCharacter;

    /* --------------------------------------------------------
       CINEMATIC SHIFT
    -------------------------------------------------------- */
    if (previousStart !== -1 && previousStart !== start) {
      animateDocumentShift();
    }

    console.log("[Scribe] Document window:", {
      start,
      end,
      current: getCurrentFlatIndex(),
      total: flatLines.length,
      domLines: documentContainer.children.length,
    });
  }


  /**
   * Inicializa un documento nuevo.
   */
  function initializeDocument(documentData: DocumentContent): void {
    currentDocument = documentData;
    flatLines = flattenDocument(documentData);
    documentTitle.textContent = documentData.metadata.title;

    /* --------------------------------------------------------
       RESET RENDER CACHE
    -------------------------------------------------------- */
    renderedStart = -1;
    renderedEnd = -1;
    renderedParagraph = -1;
    renderedLine = -1;
    renderedCharacter = -1;

    /* --------------------------------------------------------
       INITIAL RENDER
    -------------------------------------------------------- */
    renderDocumentWindow(true);
  }

function updateErrorCounter(): void {
  const slots =
    errorCounter.querySelectorAll<HTMLElement>(
      "[data-error-slot]"
    );

  slots.forEach((slot, index) => {
    slot.classList.toggle(
      "is-active",
      index < displayedErrors
    );
  });
}

function syncErrorCounter(): void {
  if (errorCounterTimeout !== null) {
    return;
  }

  displayedErrors = run.errors;
  updateErrorCounter();
}

  /* ==========================================================
     UI
  ========================================================== */
  function updateUI(): void {
    status.textContent = run.status.toUpperCase();
    time.textContent = `${run.timeRemaining.toFixed(1)}s`;
    errors.textContent = String(run.errors);
    syncErrorCounter();
    totalErrors.textContent = String(run.totalErrors);
    bullets.textContent = String(run.bullets);
    survived.textContent = String(run.survivedCount);
    corruption.textContent = String(run.corruption);
    corruptionStage.textContent = String(coordinator.getCorruptionStage(run));

    /* --------------------------------------------------------
       CURRENT LINE
    -------------------------------------------------------- */
    const paragraph = run.document.paragraphs[run.currentParagraph];
    const line = paragraph?.lines[run.currentLine];

    if (line) {
      currentLine.textContent = line.text;
      characterProgress.textContent = `${run.characterIndex} / ${line.text.length}`;
    } else {
      currentLine.textContent = "—";
      characterProgress.textContent = "0 / 0";
    }

    /* --------------------------------------------------------
       DOCUMENT WINDOW
    -------------------------------------------------------- */
    renderDocumentWindow();

    updateEndScreens();

    /* --------------------------------------------------------
       TERMINAL STATES
    -------------------------------------------------------- */
    if (run.status === "dead") {
      message.textContent = "HAS MUERTO.";
    } else if (run.status === "completed") {
      message.textContent = "DOCUMENTO COMPLETADO.";
    }
  }

  /* ==========================================================
     RESTART RUN
  ========================================================== */
  function restartRun(): void {
    const previousDocument = currentDocument;
    currentDocument = selectDocument(previousDocument);

      if (errorCounterTimeout !== null) {
    window.clearTimeout(errorCounterTimeout);
    errorCounterTimeout = null;
  }

  displayedErrors = 0;
  updateErrorCounter()

    /* --------------------------------------------------------
       RESET ERROR VISUAL
    -------------------------------------------------------- */
    errorParagraph = null;
    errorLine = null;
    errorCharacter = null;

    /* --------------------------------------------------------
       CREATE NEW RUN
    -------------------------------------------------------- */
    run = coordinator.createRun(currentDocument);
    resetRevolver();
    initializeDocument(currentDocument);
    message.textContent = "Nueva run iniciada.";
    lastAction.textContent = "new-run";
    updateUI();

    console.log("[Scribe] New run created:", run);
    console.log("[Scribe] New document:", currentDocument.metadata.id);
  }

  /* ============================================================
     INPUT HANDLING
  ============================================================ */

  function handleKeyDown(event: KeyboardEvent): void {
    /* --------------------------------------------------------
       RESTART
    -------------------------------------------------------- */

    /* --------------------------------------------------------
       IGNORE MODIFIERS / NON CHARACTER KEYS
    -------------------------------------------------------- */
    if (
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      event.key.length !== 1
    ) {
      return;
    }

    /* --------------------------------------------------------
       GAME MUST BE RUNNING
    -------------------------------------------------------- */
    if (run.status !== "running") {
      return;
    }

    if (revolverAnimating) {
  return;
}

    event.preventDefault();

    /* --------------------------------------------------------
       CAPTURE CURRENT POSITION BEFORE PROCESSING THE CHARACTER
    -------------------------------------------------------- */
    const paragraph = run.currentParagraph;
    const line = run.currentLine;
    const character = run.characterIndex;

    /* --------------------------------------------------------
       PROCESS CHARACTER
    -------------------------------------------------------- */
    const action = coordinator.processCharacter(run, event.key);
    lastAction.textContent = action;

    /* ========================================================
       ACTION RESULT
    ======================================================== */
    switch (action) {
      case "error": {
        /**
         * El error queda registrado visualmente.
         *
         * Guardamos la posición ANTES de que
         * RunCoordinator modifique el estado.
         */
        errorParagraph = paragraph;
        errorLine = line;
        errorCharacter = character;
        displayedErrors = run.errors;
        message.textContent = "ERROR.";
        break;
      }
      case "correct": {
        /**
         * Si el jugador corrige exactamente
         * el carácter donde ocurrió el error,
         * eliminamos la marca visual.
         */
        if (
          errorParagraph === paragraph &&
          errorLine === line &&
          errorCharacter === character
        ) {
          errorParagraph = null;
          errorLine = null;
          errorCharacter = null;
        }
        break;
      }

      case "survived": {
  errorParagraph = null;
  errorLine = null;
  errorCharacter = null;

  displayedErrors = 3;
  updateErrorCounter();

  if (errorCounterTimeout !== null) {
    window.clearTimeout(errorCounterTimeout);
  }

  errorCounterTimeout = window.setTimeout(() => {
    displayedErrors = 0;
    updateErrorCounter();
    errorCounterTimeout = null;
  }, ERROR_DISPLAY_DURATION);

  message.textContent = "HAS SOBREVIVIDO.";

  spinRevolver("survived");

  break;
}

case "dead": {
  displayedErrors = 3;
  updateErrorCounter();

  if (errorCounterTimeout !== null) {
    window.clearTimeout(errorCounterTimeout);
  }

  errorCounterTimeout = window.setTimeout(() => {
    displayedErrors = 0;
    updateErrorCounter();
    errorCounterTimeout = null;
  }, ERROR_DISPLAY_DURATION);

  message.textContent = "HAS MUERTO.";

  spinRevolver("dead");

  break;
}

case "paragraph-complete": {
  errorParagraph = null;
  errorLine = null;
  errorCharacter = null;

  resetRevolver();

  message.textContent =
    "CHECKPOINT.";

  break;
}

      case "completed": {
        /**
         * Documento completado.
         *
         * Limpiamos cualquier marca temporal
         * porque el documento terminó.
         */
        errorParagraph = null;
        errorLine = null;
        errorCharacter = null;
        message.textContent =
          "DOCUMENTO COMPLETADO. Presiona R para una nueva run.";
        break;
      }
    }

    /* --------------------------------------------------------
       UPDATE UI
    -------------------------------------------------------- */
    updateUI();

    console.log("[Scribe] Key:", event.key, "Action:", action, "Current:", {
      paragraph: run.currentParagraph,
      line: run.currentLine,
      character: run.characterIndex,
    });
  }

  /* ============================================================
     GAME LOOP & STARTUP
  ============================================================ */

  /* ------------------------------------------------------------
     INITIAL DOCUMENT
  ------------------------------------------------------------ */
  currentDocument = selectDocument();
  run = coordinator.createRun(currentDocument);
  console.log("[Scribe] Run created:", run);
  console.log("[Scribe] Selected document:", currentDocument.metadata.id);
  initializeDocument(currentDocument);

  /* ------------------------------------------------------------
     GAME LOOP
  ------------------------------------------------------------ */
  const gameLoop = new GameLoop((deltaTime) => {
    coordinator.update(run, deltaTime);
    updateUI();
  });

  /* ------------------------------------------------------------
     INPUT
  ------------------------------------------------------------ */
deathScreen.addEventListener(
  "run:restart",
  restartRun
);

completionScreen.addEventListener(
  "run:restart",
  restartRun
);

game.addEventListener("keydown", handleKeyDown);
game.focus();

  /* ------------------------------------------------------------
     INITIAL UI
  ------------------------------------------------------------ */
  updateUI();

  /* ------------------------------------------------------------
     START
  ------------------------------------------------------------ */
  gameLoop.start();
  console.log("[Scribe] Game loop started");
}

/* ============================================================
   AUTO INITIALIZATION
============================================================ */

