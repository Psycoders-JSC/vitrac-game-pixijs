import { Sprite, Texture } from "pixi.js";

import { getPlayerScale } from "./spriteScale";

/** Player ship - left/right movement, shoots bullets */
export class Player extends Sprite {
  public readonly baseSpeed = 12;

  private _speed = 8;
  private _scaleFactor = 1;
  /** Multiplier from move speed power-up (default 1) */
  public moveSpeedMultiplier = 1;
  private _tiltAngle = 0;
  private static readonly MAX_TILT = 12;
  private static readonly TILT_LERP = 0.2;

  constructor(screenWidth: number, screenHeight: number) {
    super({
      texture: Texture.from("game/spaceship.png"),
      anchor: { x: 0.5, y: 1 },
    });
    this._scaleFactor = getPlayerScale(screenWidth);
    this.scale.set(this._scaleFactor);
    this._speed = this.baseSpeed * this._scaleFactor;
    const margin = 12 * (screenWidth / 360);
    this.position.set(screenWidth / 2, screenHeight - margin);
  }

  public get speed(): number {
    return this._speed;
  }

  public updateSize(screenWidth: number, screenHeight: number): void {
    this._scaleFactor = getPlayerScale(screenWidth);
    this.scale.set(this._scaleFactor);
    this._speed = this.baseSpeed * this._scaleFactor;
    const margin = 12 * (screenWidth / 360);
    this.x = Math.min(this.x, screenWidth - this.width / 2);
    this.x = Math.max(this.x, this.width / 2);
    this.y = screenHeight - margin;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public moveLeft(_screenWidth: number, speedMultiplier = 1): void {
    if (this.x > this.width / 2) {
      this.x -= this._speed * speedMultiplier * this.moveSpeedMultiplier;
    }
  }

  public moveRight(screenWidth: number, speedMultiplier = 1): void {
    if (this.x < screenWidth - this.width / 2) {
      this.x += this._speed * speedMultiplier * this.moveSpeedMultiplier;
    }
  }

  /** Update sprite tilt based on horizontal movement direction */
  public updateTilt(movingLeft: boolean, movingRight: boolean): void {
    let target = 0;
    if (movingLeft) target = Player.MAX_TILT;
    else if (movingRight) target = -Player.MAX_TILT;
    this._tiltAngle += (target - this._tiltAngle) * Player.TILT_LERP;
    this.angle = this._tiltAngle;
  }

  public getRect(): { x: number; y: number; width: number; height: number } {
    const w = this.width;
    const h = this.height;
    return {
      x: this.x - w / 2,
      y: this.y - h,
      width: w,
      height: h,
    };
  }
}
