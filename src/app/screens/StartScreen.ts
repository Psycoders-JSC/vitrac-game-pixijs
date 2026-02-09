import { FancyButton } from "@pixi/ui";
import { Container, Sprite, Text, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Label } from "../ui/Label";
import { storage } from "../../engine/utils/storage";
import { GameScreen } from "./GameScreen";

const PLAYER_NAME_KEY = "jamInvaderPlayerName";

/** Start screen: player name, Asmaa avatar, Jam Invader title, Play button */
export class StartScreen extends Container {
  public static assetBundles = ["game", "main"];

  private playButton: FancyButton;
  private avatarSprite: Sprite;
  private titleText: Text;

  constructor() {
    super();

    this.avatarSprite = new Sprite({
      texture: Texture.from("game/Asmaa.png"),
      anchor: 0.5,
    });
    this.addChild(this.avatarSprite);

    this.titleText = new Text({
      text: "Jam Invader",
      style: {
        fill: 0x00ffff,
        fontSize: 48,
        fontWeight: "bold",
        align: "center",
      },
      anchor: { x: 0.5, y: 0.5 },
    });
    this.addChild(this.titleText);

    this.playButton = new FancyButton({
      defaultView: "button.png",
      nineSliceSprite: [38, 50, 38, 50],
      anchor: 0.5,
      text: new Label({
        text: "Play",
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
    this.playButton.onPress.connect(this.handlePlay.bind(this));
    this.playButton.onHover.connect(() =>
      engine().audio.sfx.play("main/sounds/sfx-hover.wav"),
    );
    this.playButton.onDown.connect(() =>
      engine().audio.sfx.play("main/sounds/sfx-press.wav"),
    );
    this.addChild(this.playButton);
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

    const scale = Math.min(width / 360, height / 480);
    this.avatarSprite.position.set(centerX, centerY - 100);
    this.avatarSprite.scale.set(scale);

    this.titleText.position.set(centerX, centerY - 30);
    (this.titleText.style as { fontSize?: number }).fontSize = Math.max(28, Math.min(48, width * 0.12));

    this.playButton.position.set(centerX, centerY + 60);
    this.playButton.scale.set(Math.min(1, width / 360));
  }

  public async show() {
    this.alpha = 1;
  }
}
