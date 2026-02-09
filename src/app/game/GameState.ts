/** Game state: score, lives, level, screen dimensions */
export class GameState {
  public score = 0;
  public lives = 3;
  public level = 1;
  public maxLevel = 10;
  public gameState:
    | "playing"
    | "gameover"
    | "levelComplete"
    | "powerUpDrop"
    | "start" = "playing";

  /** Mobile portrait base (9:16) */
  public screenWidth = 360;
  public screenHeight = 640;

  /** Base dimensions for scaling - mobile portrait */
  public readonly baseWidth = 360;
  public readonly baseHeight = 640;

  public getScale(): number {
    return this.screenWidth / this.baseWidth;
  }

  public reset(): void {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameState = "playing";
  }

  public get highScore(): number {
    const stored = localStorage.getItem("highScore");
    return stored ? parseInt(stored, 10) : 0;
  }

  public setHighScore(value: number): void {
    localStorage.setItem("highScore", String(value));
  }
}
