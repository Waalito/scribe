import type { DocumentContent } from '@/types/document';
import type { RunState } from '@/types/run';

import { CheckpointSystem } from '@/systems/checkpoint/CheckpointSystem';

import {
  TypingSystem,
  type TypingResult,
} from '@/systems/typing/TypingSystem';

import {
  TimerSystem,
} from '@/systems/timer/TimerSystem';

import {
  WeaponSystem,
} from '@/systems/weapon/WeaponSystem';

import {
  CorruptionSystem,
} from '@/systems/corruption/CorruptionSystem';

import {
  CorruptionEffectsSystem,
} from '@/systems/corruption/CorruptionEffectsSystem';

import {
  CorruptionTransitionSystem,
} from '@/systems/corruption/CorruptionTransitionSystem';

import {
  ErrorFeedbackSystem,
} from '@/systems/feedback/ErrorFeedbackSystem';

import {
  CheckpointFeedbackSystem,
} from '@/systems/feedback/CheckpointFeedbackSystem';

import { RunSystem } from './RunSystem';

export type RunActionResult =
  | TypingResult
  | 'survived'
  | 'dead'
  | 'completed';

export class RunCoordinator {
  /*
   * ============================================================
   * CORE SYSTEMS
   * ============================================================
   */

  private readonly runSystem: RunSystem;

  private readonly typingSystem: TypingSystem;

  private readonly checkpointSystem: CheckpointSystem;

  private readonly weaponSystem: WeaponSystem;

  private readonly timerSystem: TimerSystem;

  private readonly corruptionSystem: CorruptionSystem;

  /*
   * ============================================================
   * CORRUPTION
   * ============================================================
   */

  private readonly corruptionEffectsSystem:
    CorruptionEffectsSystem;

  private readonly corruptionTransitionSystem:
    CorruptionTransitionSystem;

  /*
   * ============================================================
   * FEEDBACK
   * ============================================================
   */

  private readonly errorFeedbackSystem:
    ErrorFeedbackSystem;

  private readonly checkpointFeedbackSystem:
    CheckpointFeedbackSystem;

  constructor(timeLimit = 300) {
    /*
     * ----------------------------------------------------------
     * CORE
     * ----------------------------------------------------------
     */

    this.runSystem =
      new RunSystem();

    this.typingSystem =
      new TypingSystem();

    this.weaponSystem =
      new WeaponSystem();

    this.timerSystem =
      new TimerSystem(timeLimit);

    this.checkpointSystem =
      new CheckpointSystem(
        this.runSystem,
        this.timerSystem,
      );

    /*
     * ----------------------------------------------------------
     * CORRUPTION
     * ----------------------------------------------------------
     */

    this.corruptionSystem =
      new CorruptionSystem();

    this.corruptionEffectsSystem =
      new CorruptionEffectsSystem(
        this.corruptionSystem,
      );

    this.corruptionTransitionSystem =
      new CorruptionTransitionSystem();

    /*
     * ----------------------------------------------------------
     * FEEDBACK
     * ----------------------------------------------------------
     */

    this.errorFeedbackSystem =
      new ErrorFeedbackSystem();

    this.checkpointFeedbackSystem =
      new CheckpointFeedbackSystem();
  }

  /*
   * ============================================================
   * RUN
   * ============================================================
   */

  createRun(
    document: DocumentContent,
  ): RunState {
    const run =
      this.runSystem.createRun(
        document,
      );

    /*
     * Inicializa el timer.
     */
    this.timerSystem.initialize(
      run,
    );

    /*
     * ----------------------------------------------------------
     * CORRUPTION INITIALIZATION
     * ----------------------------------------------------------
     *
     * Un documento nuevo comienza
     * siempre con corrupción 0.
     *
     * Stage I es el estado inicial.
     *
     * No existe transición inicial.
     */

    const initialEffects =
      this.corruptionEffectsSystem.getEffects(
        run,
      );

    this.corruptionTransitionSystem.initialize(
      initialEffects,
    );

    /*
     * ----------------------------------------------------------
     * FEEDBACK INITIALIZATION
     * ----------------------------------------------------------
     *
     * Todos los feedbacks comienzan
     * completamente inactivos.
     */

    this.errorFeedbackSystem.reset();

    this.checkpointFeedbackSystem.reset();

    return run;
  }

  /*
   * ============================================================
   * INPUT
   * ============================================================
   */

  processCharacter(
    run: RunState,
    character: string,
  ): RunActionResult {
    /*
     * Una partida terminada no acepta input.
     */

    if (
      run.status !== 'running'
    ) {
      return run.status;
    }

    /*
     * ----------------------------------------------------------
     * CHECKPOINT INPUT LOCK
     * ----------------------------------------------------------
     *
     * Durante:
     *
     * feedback = 1000 ms
     * break    = 3000 ms
     *
     * el input se ignora.
     *
     * ErrorFeedback NO bloquea input.
     */

    if (
      !this.checkpointFeedbackSystem
        .canAcceptInput()
    ) {
      return 'correct';
    }

    /*
     * ----------------------------------------------------------
     * TYPING SYSTEM
     * ----------------------------------------------------------
     *
     * TypingSystem es quien determina
     * si el carácter es correcto,
     * incorrecto o completa una unidad.
     */

    const result =
      this.typingSystem.processCharacter(
        run,
        character,
      );

    /*
     * ==========================================================
     * ERROR
     * ==========================================================
     */

    if (
      result === 'error'
    ) {
      /*
       * El error ya fue registrado
       * por TypingSystem.
       *
       * Ahora comienza el feedback visual.
       */

      this.errorFeedbackSystem.trigger({
        lineLength:
          this.getCurrentLineLength(
            run,
          ),
      });

      /*
       * --------------------------------------------------------
       * WEAPON CHECK
       * --------------------------------------------------------
       *
       * El arma se resuelve inmediatamente
       * cuando se alcanza el tercer error.
       */

      if (
        run.errors >= 3
      ) {
        const weaponResult =
          this.weaponSystem.addBullet(
            run,
          );

        /*
         * Los errores desaparecen
         * inmediatamente después
         * de resolver el disparo.
         */

        this.runSystem.resetErrors(
          run,
        );

        /*
         * ======================================================
         * DEATH
         * ======================================================
         *
         * Orden obligatorio:
         *
         * error
         *   ↓
         * arma
         *   ↓
         * muerte
         *   ↓
         * corrupción = 0
         *   ↓
         * run = dead
         */

        if (
          weaponResult === 'dead'
        ) {
          this.corruptionSystem.reset(
            run,
          );

          this.runSystem.markDead(
            run,
          );

          /*
           * El estado visual de corrupción
           * comienza su transición hacia Stage I.
           */

          const deathEffects =
            this.corruptionEffectsSystem.getEffects(
              run,
            );

          this.corruptionTransitionSystem.setTarget(
            deathEffects,
          );

          return 'dead';
        }

        /*
         * ======================================================
         * SURVIVAL
         * ======================================================
         *
         * El jugador sobrevivió al arma.
         *
         * Ahora aumenta la corrupción.
         */

        this.corruptionSystem
          .increaseAfterSurvival(
            run,
          );

        /*
         * Recalculamos los efectos
         * basándonos en la nueva corrupción.
         */

        const survivalEffects =
          this.corruptionEffectsSystem.getEffects(
            run,
          );

        /*
         * Inicia una transición de 1000 ms.
         *
         * Si ya existía una transición,
         * CorruptionTransitionSystem
         * continúa desde el estado visual
         * actual.
         */

        this.corruptionTransitionSystem.setTarget(
          survivalEffects,
        );

        return 'survived';
      }

      /*
       * Error normal:
       *
       * - error registrado
       * - feedback iniciado
       * - no arma
       * - input sigue permitido
       */

      return 'error';
    }

    /*
     * ==========================================================
     * LINE COMPLETE
     * ==========================================================
     */

    if (
      result === 'line-complete'
    ) {
      this.runSystem.advanceLine(
        run,
      );

      return 'line-complete';
    }

    /*
     * ==========================================================
     * PARAGRAPH COMPLETE
     * ==========================================================
     *
     * Orden:
     *
     * párrafo completado
     *       ↓
     * checkpoint lógico
     *       ↓
     * errores/balas/timer se reinician
     *       ↓
     * feedback checkpoint
     *       ↓
     * break 3000 ms
     */

    if (
      result === 'paragraph-complete'
    ) {
      /*
       * Primero la lógica del checkpoint.
       */

      this.checkpointSystem
        .reachCheckpoint(
          run,
        );

      /*
       * Después comienza el feedback.
       */

      this.checkpointFeedbackSystem
        .trigger();

      /*
       * Avanzamos la posición
       * del documento.
       */

      this.runSystem.advanceLine(
        run,
      );

      return 'paragraph-complete';
    }

    /*
     * ==========================================================
     * DOCUMENT COMPLETE
     * ==========================================================
     *
     * La corrupción pertenece
     * al documento/run actual.
     *
     * Al completar:
     *
     * corrupción → 0
     * run → completed
     *
     * La transición visual vuelve
     * hacia Stage I.
     */

    if (
      result === 'document-complete'
    ) {
      this.corruptionSystem.reset(
        run,
      );

      this.runSystem.markCompleted(
        run,
      );

      const completedEffects =
        this.corruptionEffectsSystem.getEffects(
          run,
        );

      this.corruptionTransitionSystem.setTarget(
        completedEffects,
      );

      return 'completed';
    }

    /*
     * ==========================================================
     * NORMAL CORRECT CHARACTER
     * ==========================================================
     */

    return 'correct';
  }

  /*
   * ============================================================
   * GAME LOOP
   * ============================================================
   *
   * Existe un único punto de actualización
   * para los sistemas temporales.
   *
   * deltaTime:
   *
   * segundos
   *
   * Ejemplo:
   *
   * 16 ms ≈ 0.016 s
   */

  update(
    run: RunState,
    deltaTime: number,
  ): void {
    /*
     * Ignoramos valores inválidos.
     */

    if (
      deltaTime <= 0
    ) {
      return;
    }

    /*
     * ----------------------------------------------------------
     * CORRUPTION TRANSITION
     * ----------------------------------------------------------
     *
     * La corrupción continúa actualizándose
     * aunque exista:
     *
     * - error feedback
     * - checkpoint feedback
     * - break
     *
     * Son sistemas independientes.
     */

    this.corruptionTransitionSystem.update(
      deltaTime,
    );

    /*
     * ----------------------------------------------------------
     * ERROR FEEDBACK
     * ----------------------------------------------------------
     */

    this.errorFeedbackSystem.update(
      deltaTime,
    );

    /*
     * ----------------------------------------------------------
     * CHECKPOINT FEEDBACK
     * ----------------------------------------------------------
     */

    this.checkpointFeedbackSystem.update(
      deltaTime,
    );

    /*
     * ----------------------------------------------------------
     * RUN STATE
     * ----------------------------------------------------------
     *
     * Después de actualizar los feedbacks,
     * comprobamos si la partida continúa viva.
     */

    if (
      run.status !== 'running'
    ) {
      return;
    }

    /*
     * ----------------------------------------------------------
     * TIMER
     * ----------------------------------------------------------
     */

    this.timerSystem.tick(
      run,
      deltaTime,
    );

    /*
     * ----------------------------------------------------------
     * TIMEOUT
     * ----------------------------------------------------------
     */

    if (
      this.timerSystem.isExpired(
        run,
      )
    ) {
      /*
       * Primero corrupción → 0.
       */

      this.corruptionSystem.reset(
        run,
      );

      /*
       * Después la partida muere.
       */

      this.runSystem.markDead(
        run,
      );

      /*
       * Finalmente la capa visual
       * vuelve hacia Stage I mediante
       * una transición de 1000 ms.
       */

      const timeoutEffects =
        this.corruptionEffectsSystem.getEffects(
          run,
        );

      this.corruptionTransitionSystem.setTarget(
        timeoutEffects,
      );
    }
  }

  /*
   * ============================================================
   * LEGACY TIMER API
   * ============================================================
   *
   * Se conserva temporalmente para código
   * antiguo.
   *
   * La arquitectura nueva debe utilizar:
   *
   * update(run, deltaTime)
   */

  tick(
    run: RunState,
    seconds = 1,
  ): void {
    this.update(
      run,
      seconds,
    );
  }

  /*
   * ============================================================
   * CORRUPTION
   * ============================================================
   */

  getCorruptionStage(
    run: RunState,
  ): ReturnType<
    CorruptionSystem['getStage']
  > {
    return this.corruptionSystem.getStage(
      run,
    );
  }

  /*
   * ============================================================
   * CORRUPTION EFFECTS
   * ============================================================
   */

  getCorruptionEffects(
    run: RunState,
  ) {
    return this.corruptionEffectsSystem.getEffects(
      run,
    );
  }

  /*
   * ============================================================
   * CORRUPTION TRANSITION
   * ============================================================
   */

  getCorruptionTransitionState() {
    return this.corruptionTransitionSystem.getState();
  }

  /*
   * ============================================================
   * ERROR FEEDBACK
   * ============================================================
   */

  getErrorFeedbackState() {
    return this.errorFeedbackSystem.getState();
  }

  /*
   * ============================================================
   * CHECKPOINT FEEDBACK
   * ============================================================
   */

  getCheckpointFeedbackState() {
    return this.checkpointFeedbackSystem.getState();
  }

  /*
   * ============================================================
   * CURRENT LINE
   * ============================================================
   *
   * El sistema de feedback no conoce
   * DocumentContent.
   *
   * RunCoordinator solamente le proporciona
   * la información mínima que necesita:
   *
   * longitud de la línea actual.
   *
   * El rollback visual será responsabilidad
   * de la capa que consuma
   * ErrorFeedbackState.
   */

  private getCurrentLineLength(
    run: RunState,
  ): number {
    const paragraph =
      run.document.paragraphs[
        run.currentParagraph
      ];

    if (!paragraph) {
      return 1;
    }

    const line =
      paragraph.lines[
        run.currentLine
      ];

    if (!line) {
      return 1;
    }

    return Math.max(
      1,
      line.text.length,
    );
  }
}