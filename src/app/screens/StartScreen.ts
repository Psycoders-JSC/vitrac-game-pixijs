import { Container, Sprite, Text, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { storage } from "../../engine/utils/storage";
import { GameScreen } from "./GameScreen";

const PLAYER_NAME_KEY = "jamInvaderPlayerName";

/** Start screen: player name input, Asmaa background, Jam Invader title */
export class StartScreen extends Container {
  public static assetBundles = ["game", "main"];

  private backgroundSprite: Sprite;
  private titleText: Text;

  constructor() {
    super();

    this.backgroundSprite = new Sprite({
      texture: Texture.from("game/Asmaa.png"),
      anchor: 0.5,
    });
    this.addChild(this.backgroundSprite);

    this.titleText = new Text({
      text: "Jam Invader",
      style: {
        fill: 0x00ffff,
        fontSize: 48,
        fontWeight: "bold",
        align: "center",
      },
      anchor: { x: 0.5, y: -5.5 },
    });
    this.addChild(this.titleText);
  }

  private handlePlay() {
    const input = document.getElementById(
      "playerNameInput",
    ) as HTMLInputElement;
    const name = (input?.value?.trim() ?? "") || "Player";
    storage.setString(PLAYER_NAME_KEY, name);
    document.getElementById("start-overlay")?.classList.add("hidden");
    document.body.classList.remove("start-overlay-visible");
    engine().navigation.showScreen(GameScreen);
  }

  public prepare() {
    const input = document.getElementById(
      "playerNameInput",
    ) as HTMLInputElement;
    if (input) {
      input.value = storage.getString(PLAYER_NAME_KEY) ?? "";
      input.placeholder = "Enter your name";
    }
    document.getElementById("start-overlay")?.classList.remove("hidden");
    document.body.classList.add("start-overlay-visible");

    const playBtn = document.getElementById("startPlayButton");
    if (playBtn && !playBtn.dataset.wired) {
      playBtn.dataset.wired = "1";
      playBtn.addEventListener("click", () => this.handlePlay());
    }
  }

  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Scale background to cover viewport without stretching (maintain aspect ratio)
    const tex = this.backgroundSprite.texture;
    const texW = tex?.width ?? 1;
    const texH = tex?.height ?? 1;
    const scaleX = width / texW;
    const scaleY = height / texH;
    const coverScale = Math.max(scaleX, scaleY);
    this.backgroundSprite.position.set(centerX, centerY);
    this.backgroundSprite.scale.set(coverScale);

    this.titleText.position.set(centerX, centerY - 30);
    (this.titleText.style as { fontSize?: number }).fontSize = Math.max(
      28,
      Math.min(48, width * 0.12),
    );
  }

  public async show() {
    this.alpha = 1;
  }
}
