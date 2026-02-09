import { FancyButton } from "@pixi/ui";
import { Container, Graphics, Text } from "pixi.js";

import { storage } from "../../engine/utils/storage";
import { engine } from "../getEngine";
import { Label } from "../ui/Label";
import {
  fetchLeaderboard,
  isLeaderboardAvailable,
  saveScore,
} from "../services/leaderboard";

const PLAYER_NAME_KEY = "jamInvaderPlayerName";

const BTN_WIDTH = 220;
const BTN_HEIGHT = 56;
const BTN_RADIUS = 12;

function createNeonButtonView(fillColor: number) {
  return new Graphics()
    .roundRect(0, 0, BTN_WIDTH, BTN_HEIGHT, BTN_RADIUS)
    .fill({ color: fillColor, alpha: 0.95 })
    .roundRect(0, 0, BTN_WIDTH, BTN_HEIGHT, BTN_RADIUS)
    .stroke({ width: 2, color: 0x00ffff });
}

/** Game over screen: final score, coupon, leaderboard, Play Again */
export class GameOverScreen extends Container {
  public static assetBundles = ["game", "main"];

  private static _finalScore = 0;
  private static _highScore = 0;
  private static _won = false;
  private static _wasNewHighScore = false;

  private titleText: Text;
  private scoreText: Text;
  private highScoreText: Text;
  private playAgainButton: FancyButton;

  constructor() {
    super();

    this.titleText = new Text({
      text: "Game Over!",
      style: {
        fill: 0x00ffff,
        fontSize: 48,
        fontWeight: "bold",
        align: "center",
      },
      anchor: { x: 0.5, y: 0.5 },
    });
    this.addChild(this.titleText);

    this.scoreText = new Text({
      text: "Score: 0",
      style: {
        fill: 0xffffff,
        fontSize: 28,
        align: "center",
      },
      anchor: { x: 0.5, y: 0.5 },
    });
    this.addChild(this.scoreText);

    this.highScoreText = new Text({
      text: "High Score: 0",
      style: {
        fill: 0xffffff,
        fontSize: 24,
        align: "center",
      },
      anchor: { x: 0.5, y: 0.5 },
    });
    this.addChild(this.highScoreText);

    this.playAgainButton = new FancyButton({
      defaultView: createNeonButtonView(0x0a0a2e),
      hoverView: createNeonButtonView(0x16213e),
      pressedView: createNeonButtonView(0x0d1b2a),
      anchor: 0.5,
      text: new Label({
        text: "Play Again",
        style: {
          fill: 0x00ffff,
          align: "center",
          fontSize: 28,
        },
      }),
      textOffset: { x: 0, y: -13 },
      defaultTextAnchor: 0.5,
      scale: 0.9,
      animations: {
        hover: {
          props: { scale: { x: 1.03, y: 1.03 } },
          duration: 100,
        },
        pressed: {
          props: { scale: { x: 0.97, y: 0.97 } },
          duration: 100,
        },
      },
    });
    this.playAgainButton.onPress.connect(this.handlePlayAgain.bind(this));
    this.playAgainButton.onHover.connect(() =>
      engine().audio.sfx.play("main/sounds/sfx-hover.wav"),
    );
    this.playAgainButton.onDown.connect(() =>
      engine().audio.sfx.play("main/sounds/sfx-press.wav"),
    );
    this.addChild(this.playAgainButton);
  }

  public static setGameOverData(
    finalScore: number,
    highScore: number,
    won: boolean,
    wasNewHighScore = false,
  ) {
    GameOverScreen._finalScore = finalScore;
    GameOverScreen._highScore = highScore;
    GameOverScreen._won = won;
    GameOverScreen._wasNewHighScore = wasNewHighScore;
  }

  private async handlePlayAgain() {
    const { GameScreen } = await import("./GameScreen");
    engine().navigation.showScreen(GameScreen);
  }

  public async prepare() {
    const { _finalScore, _highScore, _won, _wasNewHighScore } = GameOverScreen;
    this.titleText.text = _won
      ? "Congratulations! You Completed All Levels!"
      : "Game Over!";
    this.scoreText.text = `Final Score: ${_finalScore}`;
    this.highScoreText.text =
      _wasNewHighScore
        ? `High Score: ${_highScore} (New!)`
        : `High Score: ${_highScore}`;

    if (isLeaderboardAvailable()) {
      const playerName = storage.getString(PLAYER_NAME_KEY) ?? "";
      if (playerName) {
        await saveScore(playerName, _finalScore);
      }
    }

    await this.renderLeaderboard();
    document.getElementById("game-over-overlay")?.classList.add("hidden");
  }

  private async renderLeaderboard() {
    const listEl = document.getElementById("leaderboardList");
    if (!listEl) return;
    if (!isLeaderboardAvailable()) {
      listEl.innerHTML =
        '<p class="leaderboard-empty">Add Supabase credentials to see leaderboard.</p>';
      return;
    }
    try {
      const entries = await fetchLeaderboard(100);
      if (entries.length === 0) {
        listEl.innerHTML = '<p class="leaderboard-empty">No scores yet.</p>';
        return;
      }
      listEl.innerHTML = entries
        .map(
          (e, i) =>
            `<div class="leaderboard-entry">${i + 1}. ${e.player_name}: ${e.score}</div>`,
        )
        .join("");
    } catch {
      listEl.innerHTML =
        '<p class="leaderboard-empty">Failed to load leaderboard.</p>';
    }
  }

  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    const titleSize = Math.max(24, Math.min(40, width * 0.1));
    const scoreSize = Math.max(18, Math.min(28, width * 0.07));
    (this.titleText.style as { fontSize?: number }).fontSize = titleSize;
    (this.scoreText.style as { fontSize?: number }).fontSize = scoreSize;
    (this.highScoreText.style as { fontSize?: number }).fontSize = Math.max(14, scoreSize - 4);

    this.titleText.position.set(centerX, centerY - 80);
    this.scoreText.position.set(centerX, centerY - 25);
    this.highScoreText.position.set(centerX, centerY + 15);
    this.playAgainButton.position.set(centerX, centerY + 85);
    this.playAgainButton.scale.set(Math.min(1, width / 360));
  }

  public async show() {
    this.alpha = 1;
  }
}
