import { Graphics } from "pixi.js";

/** Explosion particle effect */
export class Particle extends Graphics {
  private vx: number;
  private vy: number;
  private life: number;
  private decay: number;
  private size: number;

  constructor(x: number, y: number, color: number, scale = 1) {
    super();
    this.vx = (Math.random() - 0.5) * 4 * scale;
    this.vy = (Math.random() - 0.5) * 4 * scale;
    this.life = 1;
    this.decay = 0.02;
    this.size = (Math.random() * 4 + 2) * scale;
    this.circle(0, 0, this.size);
    this.fill({ color });
    this.position.set(x, y);
  }

  public update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.alpha = this.life;
  }

  public isDead(): boolean {
    return this.life <= 0;
  }
}
