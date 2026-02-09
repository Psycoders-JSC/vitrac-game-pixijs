import { Graphics } from "pixi.js";

/** Enemy seed projectile - moves down */
export class Seed extends Graphics {
  private speed: number;
  private _radius: number;

  constructor(
    x: number,
    y: number,
    speed: number,
    color: number,
    scale: number,
  ) {
    super();
    this._radius = 3 * scale;
    this.circle(0, 0, this._radius);
    this.fill({ color, alpha: 0.9 });
    this.position.set(x, y);
    this.speed = speed;
  }

  public update(): void {
    this.y += this.speed;
  }

  public isOffScreen(screenHeight: number): boolean {
    return this.y > screenHeight + 10;
  }

  public getRect(): { x: number; y: number; width: number; height: number } {
    const d = this._radius * 2;
    return {
      x: this.x - this._radius,
      y: this.y - this._radius,
      width: d,
      height: d,
    };
  }
}
