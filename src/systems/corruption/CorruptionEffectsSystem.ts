import type { RunState } from '@/types/run';

import {
  CorruptionSystem,
  type CorruptionStage,
} from './CorruptionSystem';

export interface CorruptionEffectState {
  stage: CorruptionStage;

  darkness: number;
  blur: number;

  ambientVolume: number;
  breathingVolume: number;
  keyboardIntensity: number;

  randomSoundChance: number;

  glitchIntensity: number;
  movementIntensity: number;

  candleIntensity: number;
  illusionIntensity: number;

  sweatIntensity: number;
  anxietyIntensity: number;

  heartbeatIntensity: number;
}

export class CorruptionEffectsSystem {
  private readonly corruptionSystem: CorruptionSystem;

  constructor(
    corruptionSystem = new CorruptionSystem(),
  ) {
    this.corruptionSystem =
      corruptionSystem;
  }

  getEffects(
    run: RunState,
  ): CorruptionEffectState {
    const stage =
      this.corruptionSystem.getStage(run);

    const corruption =
      run.corruption;

    /*
     * STAGE I
     *
     * Estado prácticamente limpio.
     */
    if (stage === 'I') {
      return {
        stage,

        darkness: 0,
        blur: 0,

        ambientVolume: 0,
        breathingVolume: 0,
        keyboardIntensity: 0,

        randomSoundChance: 0,

        glitchIntensity: 0,
        movementIntensity: 0,

        candleIntensity: 0,
        illusionIntensity: 0,

        sweatIntensity: 0,
        anxietyIntensity: 0,

        heartbeatIntensity: 0,
      };
    }

    /*
     * STAGE II
     *
     * Corrupción:
     * 10 - 24
     */
    if (stage === 'II') {
      const progress =
        this.normalize(
          corruption,
          10,
          24,
        );

      return {
        stage,

        darkness:
          this.interpolate(
            0.10,
            0.25,
            progress,
          ),

        blur:
          this.interpolate(
            0.5,
            1,
            progress,
          ),

        ambientVolume:
          this.interpolate(
            0.20,
            0.45,
            progress,
          ),

        breathingVolume: 0,

        keyboardIntensity:
          this.interpolate(
            0.10,
            0.25,
            progress,
          ),

        randomSoundChance: 0,

        glitchIntensity: 0,
        movementIntensity: 0,

        candleIntensity: 0,
        illusionIntensity: 0,

        sweatIntensity: 0,

        anxietyIntensity:
          this.interpolate(
            0,
            0.10,
            progress,
          ),

        heartbeatIntensity:
          this.interpolate(
            0,
            0.05,
            progress,
          ),
      };
    }

    /*
     * STAGE III
     *
     * Corrupción:
     * 25 - 44
     */
    if (stage === 'III') {
      const progress =
        this.normalize(
          corruption,
          25,
          44,
        );

      return {
        stage,

        darkness:
          this.interpolate(
            0.25,
            0.50,
            progress,
          ),

        blur:
          this.interpolate(
            1,
            4,
            progress,
          ),

        ambientVolume:
          this.interpolate(
            0.45,
            0.70,
            progress,
          ),

        breathingVolume:
          this.interpolate(
            0.35,
            0.65,
            progress,
          ),

        keyboardIntensity:
          this.interpolate(
            0.25,
            0.60,
            progress,
          ),

        randomSoundChance:
          this.interpolate(
            0.10,
            0.20,
            progress,
          ),

        glitchIntensity:
          this.interpolate(
            0,
            0.10,
            progress,
          ),

        movementIntensity:
          this.interpolate(
            0,
            0.10,
            progress,
          ),

        candleIntensity:
          this.interpolate(
            0,
            0.25,
            progress,
          ),

        illusionIntensity:
          this.interpolate(
            0,
            0.10,
            progress,
          ),

        sweatIntensity:
          this.interpolate(
            0,
            0.10,
            progress,
          ),

        anxietyIntensity:
          this.interpolate(
            0.10,
            0.30,
            progress,
          ),

        heartbeatIntensity:
          this.interpolate(
            0.05,
            0.30,
            progress,
          ),
      };
    }

    /*
     * STAGE IV
     *
     * Corrupción:
     * 45 - 69
     */
    if (stage === 'IV') {
      const progress =
        this.normalize(
          corruption,
          45,
          69,
        );

      return {
        stage,

        darkness:
          this.interpolate(
            0.50,
            0.85,
            progress,
          ),

        blur:
          this.interpolate(
            4,
            8,
            progress,
          ),

        ambientVolume:
          this.interpolate(
            0.70,
            0.90,
            progress,
          ),

        breathingVolume:
          this.interpolate(
            0.65,
            0.85,
            progress,
          ),

        keyboardIntensity:
          this.interpolate(
            0.60,
            0.90,
            progress,
          ),

        randomSoundChance:
          this.interpolate(
            0.30,
            0.50,
            progress,
          ),

        glitchIntensity:
          this.interpolate(
            0.10,
            0.50,
            progress,
          ),

        movementIntensity:
          this.interpolate(
            0.10,
            0.50,
            progress,
          ),

        candleIntensity:
          this.interpolate(
            0.25,
            0.70,
            progress,
          ),

        illusionIntensity:
          this.interpolate(
            0.10,
            0.50,
            progress,
          ),

        sweatIntensity:
          this.interpolate(
            0.10,
            0.50,
            progress,
          ),

        anxietyIntensity:
          this.interpolate(
            0.30,
            0.65,
            progress,
          ),

        heartbeatIntensity:
          this.interpolate(
            0.30,
            0.40,
            progress,
          ),
      };
    }

    /*
     * STAGE V
     *
     * Corrupción:
     * 70+
     *
     * No existe Stage VI.
     *
     * La corrupción puede seguir aumentando
     * sin cambiar de etapa.
     */
    return {
      stage,

      darkness: 0.85,
      blur: 8,

      ambientVolume: 0.90,
      breathingVolume: 1,
      keyboardIntensity: 1,

      randomSoundChance: 0.70,

      glitchIntensity: 1,
      movementIntensity: 1,

      candleIntensity: 1,
      illusionIntensity: 1,

      sweatIntensity: 1,
      anxietyIntensity: 1,

      heartbeatIntensity: 1,
    };
  }

  /*
   * Normaliza un valor dentro de un rango.
   *
   * Ejemplo:
   *
   * 10 -> 0
   * 17 -> 0.5
   * 24 -> 1
   */
  private normalize(
    value: number,
    min: number,
    max: number,
  ): number {
    if (max <= min) {
      return 0;
    }

    return Math.min(
      1,
      Math.max(
        0,
        (value - min) / (max - min),
      ),
    );
  }

  /*
   * Interpolación lineal.
   *
   * Ejemplo:
   *
   * interpolate(0, 1, 0.5)
   * → 0.5
   */
  private interpolate(
    min: number,
    max: number,
    progress: number,
  ): number {
    return (
      min +
      (max - min) * progress
    );
  }
}