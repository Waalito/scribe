export class TypingAudio {
  private readonly keyAudios: HTMLAudioElement[] =
    Array.from({ length: 4 }, () => {
      const audio = new Audio("/audio/ambient/key.mp3");
      audio.preload = "auto";
      return audio;
    });

  private readonly failAudio = new Audio(
    "/audio/ambient/fail-key.mp3",
  );

  private readonly retryAudio = new Audio(
    "/audio/ambient/retry.wav",
  );

  private readonly wrongAudio = new Audio(
  "/audio/ambient/wrong.wav",
);

  private readonly checkpointAudio = new Audio(
  "/audio/ambient/bell.wav",
);

private readonly stampAudio = new Audio(
  "/audio/ambient/stamp2.wav",
);

private readonly bulletAudio = new Audio(
  "/audio/ambient/bullet.wav",
);

private readonly revolverSpinAudio = new Audio(
  "/audio/ambient/revolver-spin.mp3",
);

private readonly failShotAudio = new Audio(
  "/audio/ambient/fail-shot.mp3",
);

private readonly gunshotAudio = new Audio(
  "/audio/ambient/gunshot.mp3",
);

  private keyAudioIndex = 0;

  constructor() {
    this.failAudio.preload = "auto";
    this.retryAudio.preload = "auto";

    // Golpe de error: más grave y contundente.
    this.failAudio.volume = 0.8;
    this.failAudio.playbackRate = 0.85;

    // Borrado: sonido secundario al impacto.
    this.retryAudio.volume = 0.35;

    this.checkpointAudio.preload = "auto";
    this.checkpointAudio.volume = 0.5;

    this.stampAudio.preload = "auto";
    this.stampAudio.volume = 0.25;

    this.wrongAudio.preload = "auto";
    this.wrongAudio.volume = 0.5;

    // Revólver
    this.bulletAudio.preload = "auto";
    this.bulletAudio.volume = 0.6;

    this.revolverSpinAudio.preload = "auto";
    this.revolverSpinAudio.volume = 0.5;

    this.failShotAudio.preload = "auto";
    this.failShotAudio.volume = 0.65;

    this.gunshotAudio.preload = "auto";
    this.gunshotAudio.volume = 0.8;
  }

  playKey(): void {
    const audio = this.keyAudios[this.keyAudioIndex];

    this.keyAudioIndex =
      (this.keyAudioIndex + 1) % this.keyAudios.length;

    // Variaciones sutiles para evitar un tecleo monótono.
    audio.playbackRate = 0.92 + Math.random() * 0.16;
    audio.volume = 0.2 + Math.random() * 0.1;
    audio.currentTime = 0;

    this.play(audio);
  }

  playStamp(): void {
  this.stampAudio.pause();
  this.stampAudio.currentTime = 0;
  this.play(this.stampAudio);
}


  playError(): void {
    this.failAudio.pause();
    this.failAudio.currentTime = 0;

    this.play(this.failAudio);
  }

  playWrong(): void {
  this.wrongAudio.pause();
  this.wrongAudio.currentTime = 0;
  this.play(this.wrongAudio);
}

  startRollback(): void {
    this.retryAudio.pause();
    this.retryAudio.currentTime = 0;

    this.play(this.retryAudio);
  }

  stopRollback(): void {
    this.retryAudio.pause();
    this.retryAudio.currentTime = 0;
  }

//Revolver

playBullet(): void {
  this.bulletAudio.pause();
  this.bulletAudio.currentTime = 0;
  this.play(this.bulletAudio);
}

playRevolverSpin(): void {
  this.revolverSpinAudio.pause();
  this.revolverSpinAudio.currentTime = 0;
  this.play(this.revolverSpinAudio);
}

playFailShot(): void {
  this.failShotAudio.pause();
  this.failShotAudio.currentTime = 0;
  this.play(this.failShotAudio);
}

playGunshot(): void {
  this.gunshotAudio.pause();
  this.gunshotAudio.currentTime = 0;
  this.play(this.gunshotAudio);
}

//Revolver

  playCheckpoint(): void {
  this.checkpointAudio.currentTime = 0;
  this.play(this.checkpointAudio);
}





  private play(audio: HTMLAudioElement): void {
    void audio.play().catch((error: unknown) => {
      console.warn(
        "[Scribe] No se pudo reproducir el audio:",
        error,
      );
    });
  }
}