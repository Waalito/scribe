export type GameLoopCallback = (
  deltaTime: number,
) => void;

export class GameLoop {
  private animationFrameId: number | null =
    null;

  private lastTimestamp: number | null =
    null;

  private running = false;

  private readonly callback:
    GameLoopCallback;

  /*
   * Máximo deltaTime aceptado:
   *
   * 100 ms = 0.1 segundos
   *
   * Evita saltos enormes después de:
   * - pérdida de FPS
   * - cambio de pestaña
   * - congelamiento temporal
   */
  private static readonly MAX_DELTA_TIME =
    0.1;

  constructor(
    callback: GameLoopCallback,
  ) {
    this.callback = callback;
  }

  /**
   * Inicia el Game Loop.
   *
   * Si ya está ejecutándose,
   * no crea un segundo loop.
   */
  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestamp = null;

    this.animationFrameId =
      requestAnimationFrame(
        this.frame,
      );
  }

  /**
   * Detiene el Game Loop.
   */
  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (
      this.animationFrameId !== null
    ) {
      cancelAnimationFrame(
        this.animationFrameId,
      );

      this.animationFrameId = null;
    }

    this.lastTimestamp = null;
  }

  /**
   * Indica si el Game Loop está activo.
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Procesa un frame.
   */
  private frame = (
    timestamp: number,
  ): void => {
    if (!this.running) {
      return;
    }

    /*
     * Primer frame.
     *
     * No existe un deltaTime anterior
     * con el cual comparar.
     */
    if (
      this.lastTimestamp === null
    ) {
      this.lastTimestamp =
        timestamp;

      this.callback(0);

      this.scheduleNextFrame();

      return;
    }

    /*
     * requestAnimationFrame entrega
     * timestamp en milisegundos.
     *
     * Convertimos a segundos.
     */
    let deltaTime =
      (timestamp -
        this.lastTimestamp) /
      1000;

    this.lastTimestamp =
      timestamp;

    /*
     * Evitamos valores negativos
     * y saltos excesivamente grandes.
     */
    deltaTime =
      Math.min(
        Math.max(deltaTime, 0),
        GameLoop.MAX_DELTA_TIME,
      );

    /*
     * El Game Loop solamente entrega
     * deltaTime.
     *
     * No conoce ningún sistema del juego.
     */
    this.callback(deltaTime);

    this.scheduleNextFrame();
  };

  /**
   * Programa el siguiente frame.
   */
  private scheduleNextFrame(): void {
    if (!this.running) {
      return;
    }

    this.animationFrameId =
      requestAnimationFrame(
        this.frame,
      );
  }
}