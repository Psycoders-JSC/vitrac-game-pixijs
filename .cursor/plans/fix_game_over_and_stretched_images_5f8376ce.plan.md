---
name: Fix Game Over and Stretched Images
overview: Fix the immediate game over bug caused by incorrect letterbox sizing producing a 1920x240 canvas on desktop, and fix stretched images by correcting the resize logic to maintain proper aspect ratio (4:3). Updated to mobile-first (360x640 portrait).
todos:
  - id: mobile-resize
    content: Update resize options to 360x640 mobile portrait
    status: completed
  - id: mobile-game-state
    content: Update GameState base dimensions to 360x640
    status: completed
  - id: mobile-layout
    content: Restructure CSS for mobile-first vertical stack
    status: completed
  - id: mobile-screens
    content: Update StartScreen, GameOverScreen, GameScreen for portrait
    status: completed
isProject: false
---

# Fix Game Over and Stretched Images

## Root Cause Analysis

Both issues stem from the same bug in the resize logic.

### 1. Resize Logic Bug in [src/engine/resize/resize.ts](src/engine/resize/resize.ts)

When `letterbox: true` and `minWidth (320) > minHeight (240)`, the code does:

```javascript
canvasWidth = window.innerWidth;  // e.g. 1920
canvasHeight = Math.min(
  window.innerHeight,
  minHeight,           // BUG: 240 caps height regardless of window!
  canvasWidth / aspectRatio,
);
```

This **caps height at 240px** even when the window is 1920x1080. Result: **1920x240** canvas (8:1 aspect ratio).

### 2. Why Game Over Happens Immediately

The game is designed for 800x600 (4:3). With a 1920x240 canvas:

- **Player**: y = 240 - 20 = 220, height ~120 → defense line at y = 100
- **Enemies**: start at y = 50 * scale ≈ 120, height ~48 → bottom at y ≈ 168
- **Game over check** (line 373): `enemy.y + enemy.height >= player.y - player.height` → 168 >= 100 is **true**

Enemies spawn **below** the player's defense line, so the game triggers game over on the first frame.

### 3. Why Images Are Stretched

The canvas is 8:1 instead of 4:3. The background and sprites are stretched to fill this wide, short viewport.

---

## Solution

### Fix 1: Correct Letterbox Logic in [src/engine/resize/resize.ts](src/engine/resize/resize.ts)

Letterbox should **fit within the window while maintaining aspect ratio** (minWidth/minHeight). Replace the letterbox block with:

```javascript
if (letterbox) {
  const fitWidth = w / aspectRatio;
  const fitHeight = h * aspectRatio;
  if (fitWidth <= h) {
    canvasWidth = w;
    canvasHeight = Math.floor(w / aspectRatio);
  } else {
    canvasHeight = h;
    canvasWidth = Math.floor(h * aspectRatio);
  }
}
```

This ensures:

- For 1920x1080: 1920/1.333=1440 > 1080, so we use height: canvasHeight=1080, canvasWidth=1440
- Result: **1440x1080** (4:3) — fits window and maintains aspect

Also fix the bug where the code uses `window.innerWidth`/`innerHeight` instead of the passed `w` and `h`.

### Fix 2: Use Game Container for Resize (Optional but Recommended)

The canvas is currently sized to the full window (`resizeTo: window`), but the game sits inside `#game-main` between side panels. Consider resizing to the actual game container:

- In [src/main.ts](src/main.ts), pass `resizeTo: document.getElementById("pixi-container")` so the canvas matches the game area
- This gives correct sizing when side panels are visible on desktop

### Fix 3: Defensive Check in GameScreen (Safety Net)

Add a guard in [src/app/screens/GameScreen.ts](src/app/screens/GameScreen.ts) so the game over check only runs when the layout is valid:

- Ensure `initGame()` uses dimensions from `resize()` (which happens after `prepare()` in `addAndShowScreen`)
- The navigation already calls `resize(this.width, this.height)` after `prepare()`, but `prepare()` runs `initGame()` with stale `gameState.screenWidth/Height` (800/600 defaults)

**Fix order of operations**: In `initGame()`, use `engine().navigation.width` and `engine().navigation.height` if available, or defer enemy init until after first resize. Alternatively, ensure `GameState` is updated before `initGame()` — e.g. call `resize` before `prepare`, or have `prepare` read from navigation dimensions.

**Recommended**: In `GameScreen.prepare()`, before `initGame()`, set:

```javascript
this.gameState.screenWidth = engine().navigation.width || 800;
this.gameState.screenHeight = engine().navigation.height || 600;
```

This ensures `initGame()` uses the actual viewport size from the last resize.

---

## Implementation Order

1. Fix letterbox logic in `resize.ts` (fixes both issues)
2. Update `GameScreen.prepare()` to use navigation dimensions before `initGame()`
3. Optionally: switch `resizeTo` to `pixi-container` for proper desktop layout

---

## Summary of Code Changes


| File                                                           | Change                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [src/engine/resize/resize.ts](src/engine/resize/resize.ts)     | Fix letterbox to maintain aspect ratio using `w`/`h`; remove incorrect `minHeight` cap            |
| [src/app/screens/GameScreen.ts](src/app/screens/GameScreen.ts) | In `prepare()`, set `gameState.screenWidth/Height` from `engine().navigation` before `initGame()` |
| [src/main.ts](src/main.ts)                                     | (Optional) Use `document.getElementById("pixi-container")` for `resizeTo`                         |


