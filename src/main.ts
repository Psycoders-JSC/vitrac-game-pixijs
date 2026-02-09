import { setEngine } from "./app/getEngine";
import {
  fetchLeaderboard,
  isLeaderboardAvailable,
} from "./app/services/leaderboard";
import { LoadScreen } from "./app/screens/LoadScreen";
import { StartScreen } from "./app/screens/StartScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

async function renderLeaderboard() {
  const listEl = document.getElementById("leaderboardList");
  if (!listEl) return;
  if (!isLeaderboardAvailable()) {
    listEl.innerHTML =
      '<p class="leaderboard-empty">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env</p>';
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

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#0a0a2e",
    resizeOptions: { minWidth: 360, minHeight: 640, letterbox: true },
    resizeTo: document.getElementById("pixi-container") ?? window,
  });

  // Initialize the user settings
  userSettings.init();

  // Show the load screen
  await engine.navigation.showScreen(LoadScreen);
  // Show the start screen
  await engine.navigation.showScreen(StartScreen);
  // Fetch and display leaderboard
  await renderLeaderboard();
})();
