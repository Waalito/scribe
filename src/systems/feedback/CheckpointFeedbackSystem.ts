export type CheckpointFeedbackPhase =
  | 'idle'
  | 'active';

export interface CheckpointFeedbackState {
  isActive: boolean;
  phase: CheckpointFeedbackPhase;
  progress: number;
  errorFade: number;
  bulletFade: number;
  audioIntensity: number;
}

export class CheckpointFeedbackSystem {
private static readonly DURATION = 4;

  private phase: CheckpointFeedbackPhase =
    'idle';

  private elapsed = 0;

  private state: CheckpointFeedbackState = {
    isActive: false,

    phase: 'idle',

    progress: 0,

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
  this.elapsed = 0;

  this.state = {
    isActive: true,
    phase: 'active',
    progress: 0,
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
  if (!this.state.isActive || deltaTime <= 0) {
    return;
  }

  const clampedDeltaTime = Math.min(deltaTime, 0.1);

  this.elapsed += clampedDeltaTime;

  const progress = Math.min(
    this.elapsed / CheckpointFeedbackSystem.DURATION,
    1,
  );

  this.state.progress = progress;
  this.state.errorFade = progress;
  this.state.bulletFade = progress;
  this.state.audioIntensity = 1 - progress;

  if (progress >= 1) {
    this.finish();
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
  this.elapsed = 0;

  this.state = {
    isActive: false,
    phase: 'idle',
    progress: 0,
    errorFade: 0,
    bulletFade: 0,
    audioIntensity: 0,
  };
}

  private finish(): void {
  this.state = {
    isActive: false,
    phase: 'idle',
    progress: 1,
    errorFade: 1,
    bulletFade: 1,
    audioIntensity: 0,
  };

  this.elapsed = 0;
}
}
