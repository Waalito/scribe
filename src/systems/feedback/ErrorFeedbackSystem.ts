export interface ErrorFeedbackTrigger {
  lineLength: number;
}

export interface ErrorFeedbackState {
  isActive: boolean;
  progress: number;

  rollbackProgress: number;

  shakeIntensity: number;
  audioIntensity: number;

  breathingBoost: number;
}

export class ErrorFeedbackSystem {
  private static readonly DURATION = 0.25;

  private isActive = false;
  private elapsed = 0;

  private lineLength = 0;

  private state: ErrorFeedbackState = {
    isActive: false,
    progress: 0,

    rollbackProgress: 0,

    shakeIntensity: 0,
    audioIntensity: 0,

    breathingBoost: 0,
  };

  /**
   * Inicia un nuevo feedback de error.
   *
   * Si ya existe un feedback activo,
   * se reinicia desde cero.
   */
  trigger(
    data: ErrorFeedbackTrigger,
  ): void {
    this.isActive = true;
    this.elapsed = 0;

    this.lineLength = Math.max(
      1,
      data.lineLength,
    );

    this.state = {
      isActive: true,
      progress: 0,

      rollbackProgress: 0,

      shakeIntensity: 0,
      audioIntensity: 0,

      breathingBoost: 0,
    };
  }

  /**
   * Actualiza el feedback utilizando
   * deltaTime en segundos.
   */
  update(deltaTime: number): void {
    if (!this.isActive) {
      return;
    }

    if (deltaTime <= 0) {
      return;
    }

    /*
     * Evitamos que un deltaTime anormalmente
     * grande destruya el estado del feedback.
     */
    const safeDeltaTime = Math.min(
      deltaTime,
      ErrorFeedbackSystem.DURATION,
    );

    this.elapsed += safeDeltaTime;

    const progress = Math.min(
      1,
      this.elapsed /
        ErrorFeedbackSystem.DURATION,
    );

    this.state.progress = progress;

    /*
     * El rollback utiliza el mismo progreso
     * temporal del feedback.
     *
     * 0 → inicio de línea
     * 1 → rollback terminado
     */
    this.state.rollbackProgress =
      this.calculateRollbackProgress(
        progress,
      );

    /*
     * El shake ocurre principalmente
     * durante el impacto inicial.
     */
    this.state.shakeIntensity =
      this.calculateShake(progress);

    /*
     * El sonido del error nace fuerte
     * y desaparece rápidamente.
     */
    this.state.audioIntensity =
      this.calculateAudio(progress);

    /*
     * La respiración recibe un pequeño
     * incremento temporal.
     */
    this.state.breathingBoost =
      this.calculateBreathing(progress);

    if (progress >= 1) {
      this.finish();
    }
  }

  /**
   * Devuelve una copia del estado actual.
   */
  getState(): ErrorFeedbackState {
    return {
      ...this.state,
    };
  }

  /**
   * Indica si existe un feedback activo.
   */
  isFeedbackActive(): boolean {
    return this.isActive;
  }

  /**
   * Finaliza manualmente el feedback.
   */
  reset(): void {
    this.isActive = false;
    this.elapsed = 0;
    this.lineLength = 0;

    this.state = {
      isActive: false,
      progress: 0,

      rollbackProgress: 0,

      shakeIntensity: 0,
      audioIntensity: 0,

      breathingBoost: 0,
    };
  }

  private finish(): void {
    this.isActive = false;

    this.state = {
      ...this.state,

      isActive: false,
      progress: 1,
      rollbackProgress: 1,

      shakeIntensity: 0,
      audioIntensity: 0,
      breathingBoost: 0,
    };
  }

  private calculateRollbackProgress(
    progress: number,
  ): number {
    /*
     * El rollback avanza de forma lineal
     * en esta primera versión.
     *
     * La capa visual podrá convertir este
     * valor en caracteres visibles.
     */
    return progress;
  }

  private calculateShake(
    progress: number,
  ): number {
    /*
     * Impacto fuerte al principio,
     * desapareciendo durante el feedback.
     */
    return 1 - progress;
  }

  private calculateAudio(
    progress: number,
  ): number {
    /*
     * El sonido nace al máximo y
     * desaparece progresivamente.
     */
    return 1 - progress;
  }

  private calculateBreathing(
    progress: number,
  ): number {
    /*
     * La respiración sube rápidamente
     * y vuelve gradualmente hacia 0.
     */
    if (progress < 0.25) {
      return progress / 0.25;
    }

    return 1 - progress;
  }
}