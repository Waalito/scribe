export type CheckpointFeedbackPhase =
  | 'idle'
  | 'feedback'
  | 'break';

export interface CheckpointFeedbackState {
  isActive: boolean;

  phase: CheckpointFeedbackPhase;

  progress: number;

  feedbackProgress: number;
  breakProgress: number;

  errorFade: number;
  bulletFade: number;

  audioIntensity: number;
}

export class CheckpointFeedbackSystem {
  private static readonly FEEDBACK_DURATION = 1;
  private static readonly BREAK_DURATION = 3;

  private phase: CheckpointFeedbackPhase =
    'idle';

  private elapsed = 0;

  private state: CheckpointFeedbackState = {
    isActive: false,

    phase: 'idle',

    progress: 0,

    feedbackProgress: 0,
    breakProgress: 0,

    errorFade: 0,
    bulletFade: 0,

    audioIntensity: 0,
  };

  /**
   * Inicia un nuevo feedback de checkpoint.
   *
   * Si ya existe un checkpoint activo,
   * la secuencia comienza nuevamente desde cero.
   */
  trigger(): void {
    this.phase = 'feedback';
    this.elapsed = 0;

    this.state = {
      isActive: true,

      phase: 'feedback',

      progress: 0,

      feedbackProgress: 0,
      breakProgress: 0,

      errorFade: 0,
      bulletFade: 0,

      audioIntensity: 1,
    };
  }

  /**
   * Actualiza el feedback utilizando
   * deltaTime en segundos.
   */
  update(deltaTime: number): void {
    if (!this.state.isActive) {
      return;
    }

    if (deltaTime <= 0) {
      return;
    }

    /*
     * Protegemos el sistema contra un
     * deltaTime anormalmente grande.
     *
     * Nunca permitimos avanzar más allá
     * del tiempo total de la secuencia.
     */
    const totalDuration =
      CheckpointFeedbackSystem.FEEDBACK_DURATION +
      CheckpointFeedbackSystem.BREAK_DURATION;

    const safeDeltaTime = Math.min(
      deltaTime,
      totalDuration,
    );

    this.elapsed += safeDeltaTime;

    /*
     * FEEDBACK
     *
     * 0 → 1 segundo
     */
    if (
      this.phase === 'feedback'
    ) {
      const progress =
        Math.min(
          1,
          this.elapsed /
            CheckpointFeedbackSystem.FEEDBACK_DURATION,
        );

      this.state.progress = progress;
      this.state.feedbackProgress =
        progress;

      /*
       * Los errores y las balas
       * desaparecen progresivamente.
       */
      this.state.errorFade =
        progress;

      this.state.bulletFade =
        progress;

      /*
       * El sonido aparece al inicio
       * y desaparece durante el feedback.
       */
      this.state.audioIntensity =
        1 - progress;

      /*
       * Terminó el primer segundo.
       */
      if (progress >= 1) {
        this.phase = 'break';

        this.state.phase = 'break';

        this.state.breakProgress = 0;

        this.state.audioIntensity = 0;

        /*
         * El tiempo restante pertenece
         * ahora al break.
         */
        this.elapsed =
          0;
      }

      return;
    }

    /*
     * BREAK
     *
     * 0 → 3 segundos
     */
    if (
      this.phase === 'break'
    ) {
      const progress =
        Math.min(
          1,
          this.elapsed /
            CheckpointFeedbackSystem.BREAK_DURATION,
        );

      this.state.phase = 'break';

      this.state.progress =
        progress;

      this.state.breakProgress =
        progress;

      this.state.errorFade = 1;
      this.state.bulletFade = 1;

      this.state.audioIntensity = 0;

      /*
       * Terminó el descanso.
       */
      if (progress >= 1) {
        this.finish();
      }
    }
  }

  /**
   * Devuelve una copia del estado.
   */
  getState(): CheckpointFeedbackState {
    return {
      ...this.state,
    };
  }

  /**
   * Indica si el feedback o el break
   * están activos.
   */
  isFeedbackActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Indica si el juego puede aceptar input.
   *
   * Durante feedback y break:
   *
   * false
   *
   * Cuando termina:
   *
   * true
   */
  canAcceptInput(): boolean {
    return !this.state.isActive;
  }

  /**
   * Reinicia completamente el sistema.
   */
  reset(): void {
    this.phase = 'idle';
    this.elapsed = 0;

    this.state = {
      isActive: false,

      phase: 'idle',

      progress: 0,

      feedbackProgress: 0,
      breakProgress: 0,

      errorFade: 0,
      bulletFade: 0,

      audioIntensity: 0,
    };
  }

  private finish(): void {
    this.phase = 'idle';
    this.elapsed = 0;

    this.state = {
      isActive: false,

      phase: 'idle',

      progress: 1,

      feedbackProgress: 1,
      breakProgress: 1,

      errorFade: 1,
      bulletFade: 1,

      audioIntensity: 0,
    };
  }
}
