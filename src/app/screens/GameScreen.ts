import type { Ticker } from "pixi.js";
import { Container, Sprite, Text, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Bullet } from "../game/Bullet";
import {
  Enemy,
  FRUIT_COLORS,
  FRUIT_TYPES,
  type FruitType,
} from "../game/Enemy";
import { GameState } from "../game/GameState";
import { Particle } from "../game/Particle";
import { PowerUp, type PowerUpType } from "../game/PowerUp";
import { Player } from "../game/Player";
import { Seed } from "../game/Seed";
import {
  getBulletScale,
  getEnemyScale,
  getPowerUpScale,
  getSeedScale,
  SPRITE_CONFIG,
} from "../game/spriteScale";
import { GameOverScreen } from "./GameOverScreen";

/** Main gameplay screen */
export class GameScreen extends Container {
  public static assetBundles = ["game", "main"];

  private gameState: GameState;
  private background!: Sprite;
  private gameContainer!: Container;
  private player!: Player;
  private bullets: Bullet[] = [];
  private seeds: Seed[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private powerUp: PowerUp | null = null;
  private scoreText!: Text;
  private livesText!: Text;
  private levelText!: Text;
  private levelCompleteOverlay!: Text;
  private screenShake = 0;
  private gameStartFrames = 0;
  private shootCooldown = 150;
  private fireColumnCount = 1;

  constructor() {
    super();
    this.gameState = new GameState();
  }

  /** Minimum height to avoid immediate game over (enemies below player defense line) */
  private static readonly MIN_SAFE_HEIGHT = 400;

  public prepare(): void {
    this.gameState.reset();
    let w = engine().navigation.width || 360;
    let h = engine().navigation.height || 640;
    if (h < GameScreen.MIN_SAFE_HEIGHT) {
      const aspectRatio = w / (h || 1);
      h = GameScreen.MIN_SAFE_HEIGHT;
      w = Math.max(w, Math.floor(h * aspectRatio));
    }
    this.gameState.screenWidth = w;
    this.gameState.screenHeight = h;
    this.initGame();
  }

  private initGame(): void {
    this.removeChildren();
    this.bullets = [];
    this.seeds = [];
    this.enemies = [];
    this.particles = [];
    this.powerUp = null;
    this.collectedPowerUpName = null;
    this.screenShake = 0;
    this.gameStartFrames = 0;
    this.shootCooldown = 150;
    this.fireColumnCount = 1;

    const w = this.gameState.screenWidth;
    const h = this.gameState.screenHeight;

    this.background = new Sprite({
      texture: Texture.from("game/background.png"),
    });
    this.background.width = w;
    this.background.height = h;
    this.addChild(this.background);

    this.gameContainer = new Container();
    this.addChild(this.gameContainer);

    this.player = new Player(w, h);
    this.gameContainer.addChild(this.player);

    this.initEnemies();

    const fontSize = Math.max(14, Math.min(24, w * 0.055));
    this.scoreText = new Text({
      text: `Score: ${this.gameState.score}`,
      style: { fill: 0x00ffff, fontSize, fontWeight: "bold" },
    });
    this.scoreText.position.set(8, 8);
    this.addChild(this.scoreText);

    this.livesText = new Text({
      text: `Lives: ${this.gameState.lives}`,
      style: { fill: 0x00ffff, fontSize, fontWeight: "bold" },
    });
    this.livesText.position.set(8, 8 + fontSize + 4);
    this.addChild(this.livesText);

    this.levelText = new Text({
      text: `Level: ${this.gameState.level}`,
      style: { fill: 0x00ffff, fontSize, fontWeight: "bold" },
    });
    this.levelText.position.set(8, 8 + (fontSize + 4) * 2);
    this.addChild(this.levelText);

    this.levelCompleteOverlay = new Text({
      text: "",
      style: {
        fill: 0x00ffff,
        fontSize: Math.max(24, Math.min(36, w * 0.1)),
        fontWeight: "bold",
        align: "center",
      },
      anchor: { x: 0.5, y: 0.5 },
    });
    this.levelCompleteOverlay.visible = false;
    this.addChild(this.levelCompleteOverlay);
  }

  private initEnemies(): void {
    const { level } = this.gameState;
    const w = this.gameState.screenWidth;
    const enemyScale = getEnemyScale(w);

    const fruitType: FruitType = FRUIT_TYPES[(level - 1) % FRUIT_TYPES.length];
    const baseRows = 2;
    const baseCols = 4;
    const wantedRows = Math.min(baseRows + Math.floor(level / 2), 6);
    const wantedCols = Math.min(baseCols + Math.floor(level * 0.6), 10);

    const margin = 8 * (w / 360);
    const gap = 8 * (w / 360);
    const enemyWidth = SPRITE_CONFIG.enemy.targetWidth * (w / 360);
    const enemyHeight = enemyWidth;

    const maxCols = Math.max(
      1,
      Math.floor((w - 2 * margin + gap) / (enemyWidth + gap)),
    );
    const cols = Math.min(wantedCols, maxCols);
    const rows = wantedRows;

    const totalWidth = cols * enemyWidth + (cols - 1) * gap;
    const startX = (w - totalWidth) / 2;
    const spacingX = enemyWidth + gap;
    const startY = 50 * (w / 360);
    const spacingY = enemyHeight + 6 * (w / 360);

    const baseSpeed = 0.5 + (level - 1) * 0.15;
    const speed = baseSpeed * enemyScale;
    const shootInterval = Math.max(60, 180 - (level - 1) * 10);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy = new Enemy(
          startX + col * spacingX,
          startY + row * spacingY,
          fruitType,
          enemyScale,
          speed,
          shootInterval,
        );
        this.enemies.push(enemy);
        this.gameContainer.addChild(enemy);
      }
    }
  }

  private createExplosion(
    x: number,
    y: number,
    color: number,
    count: number,
    shakeAmount = 10,
    scale = 1,
  ): void {
    const w = this.gameState.screenWidth;
    const particleScale = scale * (w / 360);
    for (let i = 0; i < count; i++) {
      const p = new Particle(x, y, color, particleScale);
      this.particles.push(p);
      this.gameContainer.addChild(p);
    }
    this.screenShake = shakeAmount * (w / 360);
  }

  private shoot(): void {
    const w = this.gameState.screenWidth;
    const bulletScale = getBulletScale(w);
    const colOffset = 25 * (w / 360);
    const centerX = this.player.x;

    for (let i = 0; i < this.fireColumnCount; i++) {
      const offset = (i - (this.fireColumnCount - 1) / 2) * colOffset;
      const x = centerX + offset;
      const bullet = new Bullet(
        x,
        this.player.y - this.player.height,
        bulletScale,
      );
      this.bullets.push(bullet);
      this.gameContainer.addChild(bullet);
    }
    this.createExplosion(this.player.x, this.player.y, 0xffff00, 5, 2, 1);
    engine().audio.sfx.play("main/sounds/sfx-press.wav");
  }

  private checkCollision(
    r1: { x: number; y: number; width: number; height: number },
    r2: { x: number; y: number; width: number; height: number },
  ): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  private static readonly POWER_UP_TYPES: PowerUpType[] = [
    "fireSpeed",
    "moveSpeed",
    "extraColumn",
  ];

  private static readonly POWER_UP_NAMES: Record<PowerUpType, string> = {
    fireSpeed: "Fire Speed!",
    moveSpeed: "Move Speed!",
    extraColumn: "Extra Column!",
  };

  private collectedPowerUpName: string | null = null;
  private collectedPowerUpDisplayUntil = 0;

  private spawnPowerUp(): void {
    const w = this.gameState.screenWidth;
    const h = this.gameState.screenHeight;
    const type =
      GameScreen.POWER_UP_TYPES[
        Math.floor(Math.random() * GameScreen.POWER_UP_TYPES.length)
      ];
    const scale = getPowerUpScale(w);
    this.powerUp = new PowerUp(w / 2, h * 0.35, type, scale);
    this.gameContainer.addChild(this.powerUp);
  }

  private applyPowerUp(type: PowerUpType): void {
    switch (type) {
      case "fireSpeed":
        this.shootCooldown = Math.max(60, this.shootCooldown - 40);
        break;
      case "moveSpeed":
        this.player.moveSpeedMultiplier = Math.min(2, this.player.moveSpeedMultiplier + 0.2);
        break;
      case "extraColumn":
        this.fireColumnCount++;
        break;
    }
    this.createExplosion(this.player.x, this.player.y, 0x00ff88, 30, 5, 1);
    engine().audio.sfx.play("main/sounds/sfx-hover.wav");
  }

  private clearProjectilesAndSeeds(): void {
    for (const b of this.bullets) {
      this.gameContainer.removeChild(b);
    }
    this.bullets = [];
    for (const s of this.seeds) {
      this.gameContainer.removeChild(s);
    }
    this.seeds = [];
  }

  private advanceToNextLevel(): void {
    this.clearProjectilesAndSeeds();
    this.gameStartFrames = 0;
    this.initEnemies();
    this.levelText.text = `Level: ${this.gameState.level}`;
    this.createExplosion(
      this.gameState.screenWidth / 2,
      this.gameState.screenHeight / 2,
      0x00ffff,
      50,
      15,
      1,
    );
    this.gameState.gameState = "playing";
  }

  /** Called when game over - switch to GameOverScreen */
  private showGameOver(
    finalScore: number,
    highScore: number,
    won: boolean,
    wasNewHighScore = false,
  ): void {
    GameOverScreen.setGameOverData(finalScore, highScore, won, wasNewHighScore);
    engine().navigation.showScreen(GameOverScreen);
  }

  public update(time: Ticker): void {
    if (this.gameState.gameState === "gameover") return;

    const w = this.gameState.screenWidth;
    const h = this.gameState.screenHeight;
    const delta = time.deltaMS / 16.67;

    if (this.gameState.gameState === "powerUpDrop") {
      if (this.collectedPowerUpName && Date.now() >= this.collectedPowerUpDisplayUntil) {
        this.collectedPowerUpName = null;
        this.levelCompleteOverlay.visible = false;
        this.advanceToNextLevel();
        this.particles = this.particles.filter((p) => {
          p.update();
          if (p.isDead()) {
            this.gameContainer.removeChild(p);
            return false;
          }
          return true;
        });
        return;
      }

      if (this.powerUp) {
        if (this.keys["ArrowLeft"] || this.touchLeft) this.moveLeft();
        if (this.keys["ArrowRight"] || this.touchRight) this.moveRight();

        this.powerUp.update();
        if (this.powerUp.isOffScreen(h)) {
          this.powerUp.y = 80 * (w / 360);
          this.powerUp.x = w / 2;
        } else if (this.checkCollision(this.powerUp.getRect(), this.player.getRect())) {
          const type = this.powerUp.type;
          this.applyPowerUp(type);
          this.gameContainer.removeChild(this.powerUp);
          this.powerUp = null;
          this.collectedPowerUpName = GameScreen.POWER_UP_NAMES[type];
          this.collectedPowerUpDisplayUntil = Date.now() + 1500;
          this.levelCompleteOverlay.text = this.collectedPowerUpName;
          this.levelCompleteOverlay.visible = true;
          this.levelCompleteOverlay.position.set(w / 2, h / 2);
        }
      }

      this.particles = this.particles.filter((p) => {
        p.update();
        if (p.isDead()) {
          this.gameContainer.removeChild(p);
          return false;
        }
        return true;
      });
      return;
    }

    if (this.keys["ArrowLeft"] || this.touchLeft) this.moveLeft();
    if (this.keys["ArrowRight"] || this.touchRight) this.moveRight();

    if (this.keys[" "] && this.gameState.gameState === "playing") {
      const now = Date.now();
      if (now - this.lastShootTime > this.shootCooldown) {
        this.doShoot();
        this.lastShootTime = now;
      }
    }

    if (this.screenShake > 0) {
      this.screenShake -= 0.5 * delta;
      this.gameContainer.x = (Math.random() - 0.5) * this.screenShake;
      this.gameContainer.y = (Math.random() - 0.5) * this.screenShake;
    } else {
      this.gameContainer.x = 0;
      this.gameContainer.y = 0;
    }

    this.particles = this.particles.filter((p) => {
      p.update();
      if (p.isDead()) {
        this.gameContainer.removeChild(p);
        return false;
      }
      return true;
    });

    this.bullets = this.bullets.filter((b) => {
      b.update();
      if (b.isOffScreen(h)) {
        this.gameContainer.removeChild(b);
        return false;
      }
      return true;
    });

    this.seeds = this.seeds.filter((s) => {
      s.update();
      if (s.isOffScreen(h)) {
        this.gameContainer.removeChild(s);
        return false;
      }
      return true;
    });

    let shouldMoveDown = false;
    for (const enemy of this.enemies) {
      if (enemy.x <= 0 || enemy.x >= w - enemy.width) {
        shouldMoveDown = true;
        break;
      }
    }
    const stepDown = 15 * (w / 360);
    if (shouldMoveDown) {
      for (const enemy of this.enemies) {
        enemy.reverseDirection(stepDown);
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.update()) {
        const seedScale = getSeedScale(w);
        const seedSpeed = (3 + (this.gameState.level - 1) * 0.3) * seedScale;
        const color = FRUIT_COLORS[enemy.type];
        const seed = new Seed(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height,
          seedSpeed,
          color,
          seedScale,
        );
        this.seeds.push(seed);
        this.gameContainer.addChild(seed);
      }
    }

    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const bullet = this.bullets[bi];
      const br = bullet.getRect();
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const enemy = this.enemies[ei];
        const er = enemy.getRect();
        if (this.checkCollision(br, er)) {
          const colors: Record<FruitType, number> = {
            strawberry: 0xff1744,
            blueberry: 0x2962ff,
            mango: 0xffca28,
          };
          this.createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            colors[enemy.type] ?? 0xff1744,
            20,
            8,
            1,
          );
          this.gameContainer.removeChild(bullet);
          this.bullets.splice(bi, 1);
          this.gameContainer.removeChild(enemy);
          this.enemies.splice(ei, 1);
          this.gameState.score += 10 * this.gameState.level;
          this.scoreText.text = `Score: ${this.gameState.score}`;
          engine().audio.sfx.play("main/sounds/sfx-hover.wav");
          break;
        }
      }
    }

    const pr = this.player.getRect();
    for (let si = this.seeds.length - 1; si >= 0; si--) {
      const seed = this.seeds[si];
      if (this.checkCollision(seed.getRect(), pr)) {
        this.createExplosion(
          this.player.x,
          this.player.y - this.player.height / 2,
          0xff6b6b,
          10,
          5,
          1,
        );
        this.gameContainer.removeChild(seed);
        this.seeds.splice(si, 1);
        this.gameState.lives--;
        this.livesText.text = `Lives: ${this.gameState.lives}`;
        engine().audio.sfx.play("main/sounds/sfx-press.wav");
        if (this.gameState.lives <= 0) {
          const prevHigh = this.gameState.highScore;
          const wasNew = this.gameState.score > prevHigh;
          if (wasNew) this.gameState.setHighScore(this.gameState.score);
          const hs = Math.max(prevHigh, this.gameState.score);
          this.showGameOver(this.gameState.score, hs, false, wasNew);
          return;
        }
      }
    }

    if (this.enemies.length === 0) {
      if (this.gameState.level < this.gameState.maxLevel) {
        this.gameState.level++;
        this.gameState.gameState = "powerUpDrop";
        this.clearProjectilesAndSeeds();
        this.spawnPowerUp();
      } else {
        const prevHigh = this.gameState.highScore;
        const wasNew = this.gameState.score > prevHigh;
        if (wasNew) this.gameState.setHighScore(this.gameState.score);
        const hs = Math.max(prevHigh, this.gameState.score);
        this.showGameOver(this.gameState.score, hs, true, wasNew);
      }
    }

    this.gameStartFrames++;
    const GRACE_FRAMES = 120;
    if (this.gameStartFrames > GRACE_FRAMES) {
      for (const enemy of this.enemies) {
        if (enemy.y + enemy.height >= this.player.y - this.player.height) {
          const prevHigh = this.gameState.highScore;
          const wasNew = this.gameState.score > prevHigh;
          if (wasNew) this.gameState.setHighScore(this.gameState.score);
          const hs = Math.max(prevHigh, this.gameState.score);
          this.showGameOver(this.gameState.score, hs, false, wasNew);
          return;
        }
      }
    }
  }

  public resize(width: number, height: number): void {
    let w = width;
    let h = height;
    if (h < GameScreen.MIN_SAFE_HEIGHT) {
      const aspectRatio = w / (h || 1);
      h = GameScreen.MIN_SAFE_HEIGHT;
      w = Math.max(w, Math.floor(h * aspectRatio));
    }
    this.gameState.screenWidth = w;
    this.gameState.screenHeight = h;

    if (this.background) {
      this.background.width = w;
      this.background.height = h;
    }
    if (this.player) {
      this.player.updateSize(w, h);
    }
    if (this.levelCompleteOverlay) {
      this.levelCompleteOverlay.position.set(w / 2, h / 2);
    }
    const fontSize = Math.max(14, Math.min(24, w * 0.055));
    if (this.scoreText) {
      (this.scoreText.style as { fontSize?: number }).fontSize = fontSize;
      this.scoreText.position.set(8, 8);
    }
    if (this.livesText) {
      (this.livesText.style as { fontSize?: number }).fontSize = fontSize;
      this.livesText.position.set(8, 8 + fontSize + 4);
    }
    if (this.levelText) {
      (this.levelText.style as { fontSize?: number }).fontSize = fontSize;
      this.levelText.position.set(8, 8 + (fontSize + 4) * 2);
    }
  }

  /** Expose shoot for input handler */
  public doShoot(): void {
    if (this.gameState.gameState === "playing" && this.player) {
      this.shoot();
    }
  }

  /** Expose movement for input handler */
  public moveLeft(): void {
    const canMove =
      (this.gameState.gameState === "playing" ||
        this.gameState.gameState === "powerUpDrop") &&
      this.player;
    if (canMove) {
      const isFiring = this.keys[" "];
      const speedMultiplier = isFiring ? 1 : 2;
      this.player.moveLeft(this.gameState.screenWidth, speedMultiplier);
    }
  }

  public moveRight(): void {
    const canMove =
      (this.gameState.gameState === "playing" ||
        this.gameState.gameState === "powerUpDrop") &&
      this.player;
    if (canMove) {
      const isFiring = this.keys[" "];
      const speedMultiplier = isFiring ? 1 : 2;
      this.player.moveRight(this.gameState.screenWidth, speedMultiplier);
    }
  }

  public async show(): Promise<void> {
    this.alpha = 1;
    this.setupInput();
  }

  public async hide(): Promise<void> {
    this.removeInput();
  }

  private keys: Record<string, boolean> = {};
  private touchLeft = false;
  private touchRight = false;
  private lastShootTime = 0;
  private boundKeyDown!: (e: KeyboardEvent) => void;
  private boundKeyUp!: (e: KeyboardEvent) => void;
  private boundTouchStart!: (e: TouchEvent) => void;
  private boundTouchMove!: (e: TouchEvent) => void;
  private boundTouchEnd!: (e: TouchEvent) => void;

  private setupInput(): void {
    this.boundKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key] = true;
      if (e.key === " ") e.preventDefault();
    };
    this.boundKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };
    this.boundTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (
        this.gameState.gameState !== "playing" &&
        this.gameState.gameState !== "powerUpDrop"
      )
        return;
      const touch = e.touches[0];
      const canvas = engine().canvas;
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      const scaleX = this.gameState.screenWidth / rect.width;
      const scaleY = this.gameState.screenHeight / rect.height;
      const canvasX = touchX * scaleX;
      const canvasY = touchY * scaleY;
      if (canvasY < this.gameState.screenHeight * 0.4) {
        const now = Date.now();
        if (now - this.lastShootTime > this.shootCooldown) {
          this.doShoot();
          this.lastShootTime = now;
        }
      } else {
        const centerX = this.gameState.screenWidth / 2;
        this.touchLeft = canvasX < centerX;
        this.touchRight = canvasX >= centerX;
      }
    };
    this.boundTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (
        this.gameState.gameState !== "playing" &&
        this.gameState.gameState !== "powerUpDrop"
      )
        return;
      const touch = e.touches[0];
      const canvas = engine().canvas;
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const scaleX = this.gameState.screenWidth / rect.width;
      const canvasX = touchX * scaleX;
      const centerX = this.gameState.screenWidth / 2;
      this.touchLeft = canvasX < centerX;
      this.touchRight = canvasX >= centerX;
    };
    this.boundTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      this.touchLeft = false;
      this.touchRight = false;
    };

    document.addEventListener("keydown", this.boundKeyDown);
    document.addEventListener("keyup", this.boundKeyUp);
    const canvas = engine().canvas;
    canvas.addEventListener("touchstart", this.boundTouchStart, {
      passive: false,
    });
    canvas.addEventListener("touchmove", this.boundTouchMove, {
      passive: false,
    });
    canvas.addEventListener("touchend", this.boundTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", this.boundTouchEnd, {
      passive: false,
    });
  }

  private removeInput(): void {
    document.removeEventListener("keydown", this.boundKeyDown);
    document.removeEventListener("keyup", this.boundKeyUp);
    const canvas = engine().canvas;
    canvas.removeEventListener("touchstart", this.boundTouchStart);
    canvas.removeEventListener("touchmove", this.boundTouchMove);
    canvas.removeEventListener("touchend", this.boundTouchEnd);
    canvas.removeEventListener("touchcancel", this.boundTouchEnd);
  }
}
