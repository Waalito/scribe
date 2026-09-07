import type { CorruptionEffectState } from './CorruptionEffectsSystem';

export interface CorruptionTransitionState {
  current: CorruptionEffectState;
  target: CorruptionEffectState;

  progress: number;
  isTransitioning: boolean;
}

export class CorruptionTransitionSystem {
  /*
   * Duración de la transición:
   *
   * 1 segundo = 1000 ms
   */
  private readonly duration = 1;

  /*
   * Estado visual actual.
   */
  private current:
    CorruptionEffectState | null = null;

  /*
   * Estado desde el cual comenzó
   * la transición actual.
   */
  private transitionStart:
    CorruptionEffectState | null = null;

  /*
   * Estado objetivo.
   */
  private target:
    CorruptionEffectState | null = null;

  /*
   * Progreso:
   *
   * 0 = inicio
   * 1 = final
   */
  private progress = 1;

  /*
   * Indica si existe una transición activa.
   */
  private isTransitioning = false;

  /*
   * Primera inicialización.
   *
   * No existe transición.
   *
   * current = target
   */
  initialize(
    effects: CorruptionEffectState,
  ): void {
    this.current =
      this.cloneEffects(effects);

    this.transitionStart =
      this.cloneEffects(effects);

    this.target =
      this.cloneEffects(effects);

    this.progress = 1;

    this.isTransitioning = false;
  }

  /*
   * Establece un nuevo objetivo.
   *
   * Si ya existe una transición,
   * la transición actual se interrumpe
   * desde el estado visual actual.
   */
  setTarget(
    effects: CorruptionEffectState,
  ): void {
    /*
     * Si todavía no existe un estado actual,
     * simplemente inicializamos.
     */
    if (this.current === null) {
      this.initialize(effects);

      return;
    }

    /*
     * El estado visual actual se convierte
     * en el nuevo punto de partida.
     *
     * Esto es importante cuando una transición
     * es interrumpida.
     */
    this.transitionStart =
      this.cloneEffects(
        this.current,
      );

    /*
     * Nuevo objetivo.
     */
    this.target =
      this.cloneEffects(effects);

    /*
     * Comenzamos una nueva transición.
     */
    this.progress = 0;

    this.isTransitioning = true;
  }

  /*
   * Actualiza la transición.
   *
   * deltaTime está expresado en segundos.
   */
  update(
    deltaTime: number,
  ): CorruptionTransitionState {
    /*
     * El sistema debe inicializarse
     * antes de utilizarse.
     */
    if (
      this.current === null ||
      this.transitionStart === null ||
      this.target === null
    ) {
      throw new Error(
        'CorruptionTransitionSystem must be initialized before update().',
      );
    }

    /*
     * Si no existe una transición,
     * simplemente devolvemos el estado actual.
     */
    if (!this.isTransitioning) {
      return this.getState();
    }

    /*
     * Evitamos valores negativos.
     *
     * También limitamos deltaTime a 100 ms
     * para evitar saltos enormes después
     * de un congelamiento o pérdida de FPS.
     */
    const safeDeltaTime =
      Math.min(
        Math.max(deltaTime, 0),
        0.1,
      );

    /*
     * Como duration = 1 segundo:
     *
     * deltaTime / 1
     *
     * avanza directamente el progreso.
     */
    this.progress +=
      safeDeltaTime /
      this.duration;

    /*
     * Nunca permitimos superar 1.
     */
    this.progress =
      Math.min(
        this.progress,
        1,
      );

    /*
     * Calculamos el estado visual
     * entre transitionStart y target.
     */
    this.current =
      this.interpolateEffects(
        this.transitionStart,
        this.target,
        this.progress,
      );

    /*
     * Transición terminada.
     */
    if (this.progress >= 1) {
      /*
       * Nos aseguramos de terminar
       * exactamente en el target.
       */
      this.current =
        this.cloneEffects(
          this.target,
        );

      this.transitionStart =
        this.cloneEffects(
          this.target,
        );

      this.progress = 1;

      this.isTransitioning = false;
    }

    return this.getState();
  }

  /*
   * Devuelve el estado actual.
   *
   * Se devuelven copias para evitar
   * referencias compartidas.
   */
  getState(): CorruptionTransitionState {
    if (
      this.current === null ||
      this.target === null
    ) {
      throw new Error(
        'CorruptionTransitionSystem must be initialized before getState().',
      );
    }

    return {
      current:
        this.cloneEffects(
          this.current,
        ),

      target:
        this.cloneEffects(
          this.target,
        ),

      progress:
        this.progress,

      isTransitioning:
        this.isTransitioning,
    };
  }

  /*
   * Interpolación lineal.
   */
  private interpolate(
    from: number,
    to: number,
    progress: number,
  ): number {
    return (
      from +
      (to - from) *
        progress
    );
  }

  /*
   * Interpola todos los valores
   * numéricos de los efectos.
   *
   * El stage NO se interpola.
   *
   * El stage lógico pertenece al target
   * inmediatamente.
   */
  private interpolateEffects(
    from: CorruptionEffectState,
    to: CorruptionEffectState,
    progress: number,
  ): CorruptionEffectState {
    return {
      stage: to.stage,

      darkness:
        this.interpolate(
          from.darkness,
          to.darkness,
          progress,
        ),

      blur:
        this.interpolate(
          from.blur,
          to.blur,
          progress,
        ),

      ambientVolume:
        this.interpolate(
          from.ambientVolume,
          to.ambientVolume,
          progress,
        ),

      breathingVolume:
        this.interpolate(
          from.breathingVolume,
          to.breathingVolume,
          progress,
        ),

      keyboardIntensity:
        this.interpolate(
          from.keyboardIntensity,
          to.keyboardIntensity,
          progress,
        ),

      randomSoundChance:
        this.interpolate(
          from.randomSoundChance,
          to.randomSoundChance,
          progress,
        ),

      glitchIntensity:
        this.interpolate(
          from.glitchIntensity,
          to.glitchIntensity,
          progress,
        ),

      movementIntensity:
        this.interpolate(
          from.movementIntensity,
          to.movementIntensity,
          progress,
        ),

      candleIntensity:
        this.interpolate(
          from.candleIntensity,
          to.candleIntensity,
          progress,
        ),

      illusionIntensity:
        this.interpolate(
          from.illusionIntensity,
          to.illusionIntensity,
          progress,
        ),

      sweatIntensity:
        this.interpolate(
          from.sweatIntensity,
          to.sweatIntensity,
          progress,
        ),

      anxietyIntensity:
        this.interpolate(
          from.anxietyIntensity,
          to.anxietyIntensity,
          progress,
        ),

      heartbeatIntensity:
        this.interpolate(
          from.heartbeatIntensity,
          to.heartbeatIntensity,
          progress,
        ),
    };
  }

  /*
   * Crea una copia independiente
   * del estado de efectos.
   */
  private cloneEffects(
    effects: CorruptionEffectState,
  ): CorruptionEffectState {
    return {
      stage: effects.stage,

      darkness:
        effects.darkness,

      blur:
        effects.blur,

      ambientVolume:
        effects.ambientVolume,

      breathingVolume:
        effects.breathingVolume,

      keyboardIntensity:
        effects.keyboardIntensity,

      randomSoundChance:
        effects.randomSoundChance,

      glitchIntensity:
        effects.glitchIntensity,

      movementIntensity:
        effects.movementIntensity,

      candleIntensity:
        effects.candleIntensity,

      illusionIntensity:
        effects.illusionIntensity,

      sweatIntensity:
        effects.sweatIntensity,

      anxietyIntensity:
        effects.anxietyIntensity,

      heartbeatIntensity:
        effects.heartbeatIntensity,
    };
  }
}