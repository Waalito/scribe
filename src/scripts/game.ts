import type { DocumentContent } from "../types/document";
import { DocumentSystem } from "../systems/document/DocumentSystem";
import { RunCoordinator } from "../systems/run/RunCoordinator";
import { GameLoop } from "../systems/core/GameLoop";
import { DocumentLibrary } from "../systems/document/DocumentLibrary";

import { TypingAudio } from "../systems/audio/TypingAudio";

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
  const documentContainer = document.getElementById("document-container");
  const time = document.getElementById("run-time");
  const errors = document.getElementById("run-errors");
  const totalErrors = document.getElementById("run-total-errors");
  const survived = document.getElementById("run-survived");
  const corruption = document.getElementById("run-corruption");
  const corruptionStage = document.getElementById("corruption-stage");
  const deathScreen = document.getElementById("death-screen");
  const completionScreen = document.getElementById("completion-screen");
  const collectionCompleteScreen = document.getElementById(
  "collection-complete-screen",
);

  const revolver = document.querySelector('#revolver');
  const errorCounter = document.getElementById("error-counter");


if (
  !(documentContainer instanceof HTMLElement) ||
  !(time instanceof HTMLElement) ||
  !(errors instanceof HTMLElement) ||
  !(errorCounter instanceof HTMLElement) ||
  !(totalErrors instanceof HTMLElement) ||
  !(survived instanceof HTMLElement) ||
  !(corruption instanceof HTMLElement) ||
  !(corruptionStage instanceof HTMLElement) ||
  !(deathScreen instanceof HTMLElement) ||
  !(completionScreen instanceof HTMLElement) ||
  !(collectionCompleteScreen instanceof HTMLElement)
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
const documentLibrary = new DocumentLibrary();

const coordinator = new RunCoordinator(300);
const typingAudio = new TypingAudio();

  let currentDocument: DocumentContent;
  let run: ReturnType<RunCoordinator["createRun"]>;
    // Estado de la colección
  let collectionComplete = false;
  let showCollectionCompleteScreen = false;

  let flatLines: FlatLine[] = [];

/* ============================================================
   VISUAL ERROR STATE
============================================================ */
let errorParagraph: number | null = null;
let errorLine: number | null = null;
let errorCharacter: number | null = null;

let displayedErrors = 0;

let errorCounterTimeout: number | null = null;

const ERROR_DISPLAY_DURATION = 3000;

/**
 * Posición visual durante el rollback.
 *
 * run.characterIndex siempre representa el estado REAL.
 * Esta variable solamente retrasa visualmente la desaparición
 * de los caracteres escritos.
 */
let rollbackVisualCharacter: number | null = null;

const ROLLBACK_CHARACTER_DURATION = 45;
let rollbackAccumulator = 0;

  /* ==========================================================
     RENDER CACHE
  ========================================================== */
  let renderedStart = -1;
  let renderedEnd = -1;
  let renderedParagraph = -1;
  let renderedLine = -1;
  let renderedCharacter = -1;

  let renderedRollbackCharacter = -1;

  let renderedCheckpointPhase = "idle";
let renderedCheckpointProgress = -1;


  /* ============================================================
   REVOLVER PRESENTATION
============================================================ */

let revolverAnimating = false;
const REVOLVER_SPIN_DURATION = 3000;

/*NEW THIS THREE.JS SCENE STUDY GAME*/

let deathPhase: "idle" | "playing" | "done" = "idle";
let deathFallback: number | null = null;
const DEATH_FALLBACK_MS = 8000;

function finishDeathSequence(): void {
  if (deathPhase !== "playing") return;

  deathPhase = "done";

  if (deathFallback !== null) {
    window.clearTimeout(deathFallback);
    deathFallback = null;
  }

  updateEndScreens();
}

window.addEventListener("scene:death-complete", finishDeathSequence);

/*NEW THIS THREE.JS SCENE STUDY GAME*/

  /* ==========================================================
     SCREEN RUN & DEAD 
  ========================================================== */

function updateEndScreens(): void {
  //const isDead =
  //  run.status === "dead" &&
  // !revolverAnimating;

  /*NEW THIS THREE.JS SCENE STUDY GAME*/

  const readyForDeath = run.status === "dead" && !revolverAnimating;

// Arranca la secuencia una sola vez, cuando el revólver ya terminó.
if (readyForDeath && deathPhase === "idle") {
  deathPhase = "playing";
  window.dispatchEvent(new CustomEvent("scene:play-death"));

  // Si la escena no carga, la pantalla de muerte sale igual.
  deathFallback = window.setTimeout(finishDeathSequence, DEATH_FALLBACK_MS);
}

const isDead = readyForDeath && deathPhase === "done";

 /*NEW THIS THREE.JS SCENE STUDY GAME*/

const isCompleted =
  run.status === "completed" &&
  !showCollectionCompleteScreen;

const isCollectionComplete =
  run.status === "completed" &&
  collectionComplete &&
  showCollectionCompleteScreen;

  deathScreen.classList.toggle(
    "is-visible",
    isDead,
  );

  completionScreen.classList.toggle(
    "is-visible",
    isCompleted,
  );

  collectionCompleteScreen?.classList.toggle(
    "is-visible",
    isCollectionComplete,
  );

  deathScreen.setAttribute(
    "aria-hidden",
    String(!isDead),
  );

  completionScreen.setAttribute(
    "aria-hidden",
    String(!isCompleted),
  );

  collectionCompleteScreen?.setAttribute(
    "aria-hidden",
    String(!isCollectionComplete),
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

  typingAudio.playBullet();

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

  typingAudio.playRevolverSpin();

  revolver.dispatchEvent(
    new CustomEvent("revolver:spin", {
      detail: {
        chamber: targetChamber,
      },
    })
  );

window.setTimeout(() => {
  revolverAnimating = false;

  if (result === "survived") {
    typingAudio.playFailShot();
  } else {
    typingAudio.playGunshot();
  }

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
 function selectDocument(
  previousDocument?: DocumentContent,
): DocumentContent | null {
  const availableDocuments = documentSystem.getAvailableDocuments(
    documents,
    documentLibrary.getPreservedDocumentIds(),
  );

  if (availableDocuments.length === 0) {
    return null;
  }

  if (availableDocuments.length === 1) {
    return availableDocuments[0];
  }

  const documentsWithoutPrevious = previousDocument
    ? availableDocuments.filter(
        (doc) => doc.metadata.id !== previousDocument.metadata.id,
      )
    : availableDocuments;

  return documentSystem.selectRandomDocument(
    documentsWithoutPrevious.length > 0
      ? documentsWithoutPrevious
      : availableDocuments,
  );
}

function isCollectionComplete(): boolean {
  if (documents.length === 0) {
    return false;
  }

  const availableDocuments = documentSystem.getAvailableDocuments(
    documents,
    documentLibrary.getPreservedDocumentIds(),
  );

  return availableDocuments.length === 0;
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
function isCharacterTyped(
  flatLine: FlatLine,
  characterIndex: number
): boolean {
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
     CARACTERES DE LA LÍNEA ACTUAL
  -------------------------------------------------------- */
  if (
    flatLine.paragraphIndex === run.currentParagraph &&
    flatLine.lineIndex === run.currentLine
  ) {
    const visualCharacterIndex =
      rollbackVisualCharacter ?? run.characterIndex;

    return characterIndex < visualCharacterIndex;
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

const checkpointActive =
  coordinator.getCheckpointFeedbackState().isActive;

const isCheckpointParagraphStart =
  checkpointActive &&
  flatLine.paragraphIndex === run.currentParagraph &&
  flatLine.lineIndex === 0;

if (isCheckpointParagraphStart) {
  lineElement.classList.add(
    "is-after-checkpoint",
  );
}

const isCurrent =
  !checkpointActive &&
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

  const checkpointState =
  coordinator.getCheckpointFeedbackState();

const currentRollbackCharacter =
  rollbackVisualCharacter ?? -1;

const hasCheckpointChanged =
  renderedCheckpointPhase !== checkpointState.phase ||
  renderedCheckpointProgress !== checkpointState.progress;

const hasChanged =
  renderedStart !== start ||
  renderedEnd !== end ||
  renderedParagraph !== currentParagraph ||
  renderedLine !== currentLineIndex ||
  renderedCharacter !== currentCharacter ||
  renderedRollbackCharacter !== currentRollbackCharacter ||
  hasCheckpointChanged;

  if (!force && !hasChanged) {
    return;
  }

  const previousStart = renderedStart;

  // --------------------------------------------------------
  // RENDER DOM
  // --------------------------------------------------------

  documentContainer.replaceChildren();

  let checkpointInserted = false;

  for (let index = start; index < end; index++) {
    const flatLine = flatLines[index];

    if (!flatLine) {
      continue;
    }

    // ------------------------------------------------------
    // CHECKPOINT BREAK
    // ------------------------------------------------------

    if (
      checkpointState.isActive &&
      !checkpointInserted &&
      flatLine.paragraphIndex === run.currentParagraph &&
      flatLine.lineIndex === 0
    ) {
      documentContainer.appendChild(
        createCheckpointBreakElement(
          checkpointState.progress,
        ),
      );

      checkpointInserted = true;
    }

    // ------------------------------------------------------
    // LINE
    // ------------------------------------------------------

    const lineElement = createLineElement(
      flatLine,
      index,
    );

    documentContainer.appendChild(lineElement);
  }

  // --------------------------------------------------------
  // UPDATE CACHE
  // --------------------------------------------------------

  renderedStart = start;
  renderedEnd = end;
  renderedParagraph = currentParagraph;
  renderedLine = currentLineIndex;
  renderedCharacter = currentCharacter;

  renderedCheckpointPhase =
    checkpointState.phase;

  renderedCheckpointProgress =
    checkpointState.progress;

  renderedRollbackCharacter =
    currentRollbackCharacter;

  // --------------------------------------------------------
  // CINEMATIC SHIFT
  // --------------------------------------------------------

  if (
    previousStart !== -1 &&
    previousStart !== start
  ) {
    animateDocumentShift();
  }

  console.log("[Scribe] Document window:", {
    start,
    end,
    current: getCurrentFlatIndex(),
    total: flatLines.length,
    domLines: documentContainer.children.length,
    checkpoint: checkpointState,
  });
}


  /**
   * Inicializa un documento nuevo.
   */
  function initializeDocument(documentData: DocumentContent): void {
    currentDocument = documentData;
    flatLines = flattenDocument(documentData);

    /* --------------------------------------------------------
       RESET RENDER CACHE
    -------------------------------------------------------- */
    renderedStart = -1;
    renderedEnd = -1;
    renderedParagraph = -1;
    renderedLine = -1;
    renderedCharacter = -1;

    renderedCheckpointPhase = "idle";
    renderedCheckpointProgress = -1;

    rollbackVisualCharacter = null;
    rollbackAccumulator = 0;

    /* --------------------------------------------------------
       INITIAL RENDER
    -------------------------------------------------------- */
    renderDocumentWindow(true);
  }

function triggerErrorImpact(): void {
  
  console.log("[Scribe] ERROR IMPACT");


  const sensoryLayer =
    document.getElementById("sensory-layer");

  const sceneLayer =
    document.getElementById("scene-layer");

  if (
    !(sensoryLayer instanceof HTMLElement) ||
    !(sceneLayer instanceof HTMLElement)
  ) {
    return;
  }

  const impact =
    document.createElement("div");

  impact.className = "error-impact";

  sensoryLayer.appendChild(impact);

  sceneLayer.classList.remove(
    "scene-impact-active",
  );

  void sceneLayer.offsetWidth;

  sceneLayer.classList.add(
    "scene-impact-active",
  );

  window.setTimeout(() => {
    impact.remove();

    sceneLayer.classList.remove(
      "scene-impact-active",
    );
  }, 180);
}

function updateErrorCounter(): void {
  const slots =
    errorCounter.querySelectorAll<HTMLElement>(
      "[data-error-slot]"
    );

  slots.forEach((slot, index) => {
    const shouldBeActive = index < displayedErrors;
    const wasActive = slot.classList.contains("is-active");

    // Detectamos cuándo aparece una X nueva.
    if (shouldBeActive && !wasActive) {
      typingAudio.playWrong();
    }

    slot.classList.toggle(
      "is-active",
      shouldBeActive
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
     BAR CHECKPOINT
  ========================================================== */

function createCheckpointBreakElement(
  progress: number,
): HTMLElement {
  const container = document.createElement("div");

  container.className = "checkpoint-break";

  container.setAttribute(
    "aria-hidden",
    "true",
  );

  const bar = document.createElement("div");

  bar.className = "checkpoint-break-bar";

  bar.style.width = `${Math.max(
    0,
    1 - progress,
  ) * 100}%`;

  container.appendChild(bar);

  return container;
}

function updateRollback(deltaTime: number): void {
  if (rollbackVisualCharacter === null) {
    return;
  }

  rollbackAccumulator += deltaTime;

  const characterStep =
    ROLLBACK_CHARACTER_DURATION / 1000;

  while (rollbackAccumulator >= characterStep) {
    rollbackAccumulator -= characterStep;

    rollbackVisualCharacter -= 1;

    if (rollbackVisualCharacter <= 0) {
      rollbackVisualCharacter = null;
      typingAudio.stopRollback();
      rollbackAccumulator = 0;
      break;
    }
  }
}

function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

  /* ==========================================================
     UI
  ========================================================== */
  function updateUI(): void {
    time.textContent = formatTime(run.timeRemaining);
    errors.textContent = String(run.errors);
    syncErrorCounter();
    totalErrors.textContent = String(run.totalErrors);
    survived.textContent = String(run.survivedCount);
    corruption.textContent = String(run.corruption);
    corruptionStage.textContent = String(coordinator.getCorruptionStage(run));

    /* --------------------------------------------------------
       DOCUMENT WINDOW
    -------------------------------------------------------- */
    renderDocumentWindow();

    updateEndScreens();

  }

  /* ==========================================================
     RESTART RUN
  ========================================================== */
function restartRun(): void {
  if (isCollectionComplete()) {
    console.log("[Scribe] All documents have been preserved:", {
      totalDocuments: documents.length,
      preservedDocuments: documentLibrary.size,
    });

    return;
  }

  const previousDocument = currentDocument;
  const nextDocument = selectDocument(previousDocument);

  if (!nextDocument) {
    console.error("[Scribe] No documents available for a new run.");
    return;
  }

  currentDocument = nextDocument;

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

    rollbackVisualCharacter = null;
    rollbackAccumulator = 0;

    /* --------------------------------------------------------
       CREATE NEW RUN
    -------------------------------------------------------- */
    /*NEW THIS THREE.JS SCENE STUDY GAME*/

    deathPhase = "idle";

if (deathFallback !== null) {
  window.clearTimeout(deathFallback);
  deathFallback = null;
}

window.dispatchEvent(new CustomEvent("scene:reset"));
game.focus();

/*NEW THIS THREE.JS SCENE STUDY GAME*/

    run = coordinator.createRun(currentDocument);
    resetRevolver();
    initializeDocument(currentDocument);
    updateUI();

    console.log("[Scribe] New run created:", run);
    console.log("[Scribe] New document:", currentDocument.metadata.id);
  }

  /* ============================================================
     INPUT HANDLING
  ============================================================ */

  function beginRollbackVisual(character: number): void {
  rollbackVisualCharacter = character;
  rollbackAccumulator = 0;

  typingAudio.startRollback();
}


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



    /* ========================================================
       ACTION RESULT
    ======================================================== */

switch (action) {
  case "correct": {
    typingAudio.playKey();
    break;
  }

    case "line-complete": {
    typingAudio.playStamp();
    break;
  }

  case "error":
  case "survived":
  case "dead": {
    typingAudio.playError();
    break;
  }
}

    switch (action) {

      case "error": {
  errorParagraph = paragraph;
  errorLine = line;
  errorCharacter = character;

  beginRollbackVisual(character);

  displayedErrors = run.errors;

  triggerErrorImpact();

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
  beginRollbackVisual(character);
  triggerErrorImpact();
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


  spinRevolver("survived");

  break;
}

case "dead": {
  beginRollbackVisual(character);
  triggerErrorImpact();
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


  spinRevolver("dead");

  break;
}

case "paragraph-complete": {
  errorParagraph = null;
  errorLine = null;
  errorCharacter = null;

  resetRevolver();

  typingAudio.playCheckpoint();


  break;
}



case "completed": {
  errorParagraph = null;
  errorLine = null;
  errorCharacter = null;

  const canPreserve = documentSystem.canPreserveDocument(
    currentDocument,
    run.totalErrors,
  );

  if (canPreserve) {
    documentLibrary.preserveDocument(currentDocument);

    console.log("[Scribe] Document preserved:", {
      id: currentDocument.metadata.id,
      category: currentDocument.metadata.category,
      totalErrors: run.totalErrors,
      librarySize: documentLibrary.size,
    });
  } else {
    console.log("[Scribe] Document not preserved:", {
      id: currentDocument.metadata.id,
      category: currentDocument.metadata.category,
      totalErrors: run.totalErrors,
    });
  }

  collectionComplete = isCollectionComplete();

  if (collectionComplete) {
    console.log("[Scribe] Collection completed:", {
      totalDocuments: documents.length,
      preservedDocuments: documentLibrary.size,
    });

    setTimeout(() => {
      showCollectionCompleteScreen = true;
      updateUI();
    }, 2500);
  } else {
    console.log("[Scribe] Collection incomplete:", {
      availableDocuments: documentSystem.getAvailableDocuments(
        documents,
        documentLibrary.getPreservedDocumentIds(),
      ).length,
      preservedDocuments: documentLibrary.size,
    });
  }

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
const initialDocument = selectDocument();

if (!initialDocument) {
  if (isCollectionComplete()) {
    collectionComplete = true;
    showCollectionCompleteScreen = true;

    collectionCompleteScreen.classList.add("is-visible");
    collectionCompleteScreen.setAttribute(
      "aria-hidden",
      "false",
    );

    console.log("[Scribe] Collection already completed:", {
      totalDocuments: documents.length,
      preservedDocuments: documentLibrary.size,
    });

    return;
  }

  throw new Error("[Scribe] No documents available to start the game.");
}

currentDocument = initialDocument;
run = coordinator.createRun(currentDocument);

  console.log("[Scribe] Run created:", run);
  console.log("[Scribe] Selected document:", currentDocument.metadata.id);
  initializeDocument(currentDocument);

  /* ============================================================
   CORRUPTION → CSS VARIABLES
============================================================ */
let lastFxKey = "";
let fxPreview: number | null = null;

function publishCorruptionEffects(): void {
  const fx =
    fxPreview !== null
      ? coordinator.getCorruptionEffects({ ...run, corruption: fxPreview })
      : coordinator.getCorruptionTransitionState().current;

  const key = JSON.stringify(fx);
  if (key === lastFxKey) return;
  lastFxKey = key;

  const root = document.documentElement;
  root.dataset.corruptionStage = fx.stage;

  for (const [name, value] of Object.entries(fx)) {
    if (typeof value !== "number") continue;

    // darkness → --fx-darkness, anxietyIntensity → --fx-anxiety, etc.
    const cssName = name
      .replace(/Intensity$/, "")
      .replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);

    root.style.setProperty(`--fx-${cssName}`, String(value));
  }
}

// Solo en desarrollo: para ajustar sin tener que jugar.
if (import.meta.env.DEV) {
  (window as unknown as { __fx?: (n?: number) => void }).__fx = (n) => {
    fxPreview = n ?? null;
    publishCorruptionEffects();
  };
}

  /* ------------------------------------------------------------
     GAME LOOP
  ------------------------------------------------------------ */

  const gameLoop = new GameLoop((deltaTime) => {
  coordinator.update(run, deltaTime);
  updateRollback(deltaTime);
  updateUI();
  publishCorruptionEffects();
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