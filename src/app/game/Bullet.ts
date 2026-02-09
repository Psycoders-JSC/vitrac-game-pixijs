import { Sprite, Texture } from "pixi.js";

/** Player bullet - moves up */
export class Bullet extends Sprite {
  private speed: number;

  constructor(x: number, y: number, scale: number) {
    super({
      texture: Texture.from("game/bullet.png"),
      anchor: 0.5,
      tint: 0x00ffff,
    });
    this.scale.set(scale);
    this.position.set(x, y);
    this.speed = 10 * scale;
  }

  public update(): void {
    this.y -= this.speed;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isOffScreen(_screenHeight: number): boolean {
    return this.y < -this.height;
  }

  public getRect(): { x: number; y: number; width: number; height: number } {
    const w = this.width;
    const h = this.height;
    return {
      x: this.x - w / 2,
      y: this.y - h / 2,
      width: w,
      height: h,
    };
  }
}
