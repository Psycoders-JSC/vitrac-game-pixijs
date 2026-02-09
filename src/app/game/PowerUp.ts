import { Sprite, Texture } from "pixi.js";

/** Power-up type determines effect and sprite */
export type PowerUpType = "fireSpeed" | "moveSpeed" | "extraColumn";

const POWER_UP_SPRITES: Record<PowerUpType, string> = {
  fireSpeed: "game/products/Raspberry_1.png",
  moveSpeed: "game/products/Mango_1_0.png",
  extraColumn: "game/products/Blueberry_1.png",
};

/** Droppable power-up - Vitrac jam product sprite, drifts down for collection */
export class PowerUp extends Sprite {
  public readonly type: PowerUpType;
  private readonly dropSpeed: number;

  constructor(x: number, y: number, type: PowerUpType, scale: number) {
    super({
      texture: Texture.from(POWER_UP_SPRITES[type]),
      anchor: 0.5,
    });
    this.type = type;
    this.scale.set(scale);
    this.position.set(x, y);
    this.dropSpeed = 5 * scale;
  }

  public update(): void {
    this.y += this.dropSpeed;
  }

  public isOffScreen(screenHeight: number): boolean {
    return this.y > screenHeight + this.height;
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
