import { Sprite, Texture } from "pixi.js";

export type FruitType = "strawberry" | "blueberry" | "mango";

export const FRUIT_TYPES: FruitType[] = ["strawberry", "blueberry", "mango"];

export const FRUIT_COLORS: Record<FruitType, number> = {
  strawberry: 0x8b4513,
  blueberry: 0x2962ff,
  mango: 0xffca28,
};

/** Fruit enemy - grid movement, shoots seeds */
export class Enemy extends Sprite {
  public type: FruitType;
  public direction = 1;
  public speed: number;
  public shootCooldown = 0;
  public shootInterval: number;

  constructor(
    x: number,
    y: number,
    type: FruitType,
    scale: number,
    speed: number,
    shootInterval: number,
  ) {
    const texturePath = `game/${type}.png`;
    super({
      texture: Texture.from(texturePath),
      anchor: 0,
    });
    this.type = type;
    this.scale.set(scale);
    this.position.set(x, y);
    this.speed = speed;
    this.shootInterval = shootInterval;
  }

  public update(): boolean {
    this.x += this.speed * this.direction;
    this.shootCooldown++;
    if (this.shootCooldown >= this.shootInterval) {
      this.shootCooldown = 0;
      return true; // Signal to create seed
    }
    return false;
  }

  public reverseDirection(stepDown: number): void {
    this.direction *= -1;
    this.y += stepDown;
  }

  public getRect(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
