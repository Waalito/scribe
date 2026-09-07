import type { RunState } from '@/types/run';

export type WeaponResult =
  | 'survived'
  | 'dead';

export class WeaponSystem {
  readonly maxBullets = 6;

  addBullet(run: RunState): WeaponResult {
    run.bullets += 1;

    if (run.bullets >= this.maxBullets) {
      return 'dead';
    }

    const survived = this.resolveShot(run.bullets);

    if (survived) {
      run.survivedCount += 1;
      return 'survived';
    }

    return 'dead';
  }

  private resolveShot(bullets: number): boolean {
    const deathChance = bullets / this.maxBullets;

    return Math.random() >= deathChance;
  }
}