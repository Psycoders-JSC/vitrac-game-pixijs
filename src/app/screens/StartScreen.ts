import { Container, Sprite, Text, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { storage } from "../../engine/utils/storage";
import {
  fetchLeaderboard,
  isLeaderboardAvailable,
} from "../services/leaderboard";
import { GameScreen } from "./GameScreen";

const PLAYER_NAME_KEY = "jamInvaderPlayerName";
const PLAYER_PHONE_KEY = "jamInvaderPlayerPhone";

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

  private async renderLeaderboardPage() {
    const listEl = document.getElementById("leaderboardPageList");
    if (!listEl) return;
    if (!isLeaderboardAvailable()) {
      listEl.innerHTML =
        '<p class="leaderboard-empty">Add Supabase credentials to see leaderboard.</p>';
      return;
    }
    try {
      listEl.innerHTML = '<p class="leaderboard-loading">Loading...</p>';
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

  private handleLeaderboardClick() {
    document.getElementById("start-overlay")?.classList.add("hidden");
    document.body.classList.remove("start-overlay-visible");
    document.body.classList.add("leaderboard-page-visible");
    const page = document.getElementById("leaderboard-page");
    page?.classList.remove("hidden");
    this.renderLeaderboardPage();
  }

  private handleLeaderboardBack() {
    document.getElementById("leaderboard-page")?.classList.add("hidden");
    document.body.classList.remove("leaderboard-page-visible");
    document.getElementById("start-overlay")?.classList.remove("hidden");
    document.body.classList.add("start-overlay-visible");
  }

  private handlePlay() {
    const nameInput = document.getElementById(
      "playerNameInput",
    ) as HTMLInputElement;
    const name = (nameInput?.value?.trim() ?? "") || "Player";
    storage.setString(PLAYER_NAME_KEY, name);

    const phoneInput = document.getElementById(
      "playerPhoneInput",
    ) as HTMLInputElement;
    const phone = phoneInput?.value?.trim() ?? "";
    storage.setString(PLAYER_PHONE_KEY, phone);

    document.getElementById("start-overlay")?.classList.add("hidden");
    document.body.classList.remove("start-overlay-visible");
    engine().navigation.showScreen(GameScreen);
  }

  public prepare() {
    const nameInput = document.getElementById(
      "playerNameInput",
    ) as HTMLInputElement;
    if (nameInput) {
      nameInput.value = storage.getString(PLAYER_NAME_KEY) ?? "";
      nameInput.placeholder = "Enter your name";
    }
    const phoneInput = document.getElementById(
      "playerPhoneInput",
    ) as HTMLInputElement;
    if (phoneInput) {
      phoneInput.value = storage.getString(PLAYER_PHONE_KEY) ?? "";
      phoneInput.placeholder = "Enter your phone";
    }
    document.getElementById("start-overlay")?.classList.remove("hidden");
    document.body.classList.add("start-overlay-visible");

    const playBtn = document.getElementById("startPlayButton");
    if (playBtn && !playBtn.dataset.wired) {
      playBtn.dataset.wired = "1";
      playBtn.addEventListener("click", () => this.handlePlay());
    }

    const leaderboardBtn = document.getElementById("startLeaderboardButton");
    if (leaderboardBtn && !leaderboardBtn.dataset.wired) {
      leaderboardBtn.dataset.wired = "1";
      leaderboardBtn.addEventListener("click", () =>
        this.handleLeaderboardClick(),
      );
    }

    const backBtn = document.getElementById("leaderboardBackButton");
    if (backBtn && !backBtn.dataset.wired) {
      backBtn.dataset.wired = "1";
      backBtn.addEventListener("click", () => this.handleLeaderboardBack());
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
