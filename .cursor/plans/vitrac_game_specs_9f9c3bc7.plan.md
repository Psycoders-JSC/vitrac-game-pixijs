---
name: Vitrac Game Specs
overview: Extracted game specifications from the vitrac-game-example codebase, covering genre, mechanics, UI, assets, backend, and technical implementation.
todos: []
isProject: false
---

# Vitrac Game Specifications (Extracted)

## Game Identity

- **Project names**: "Strawberry Invader" (README), "Jam Invader" (UI)
- **Genre**: Space shooter (Chicken Invader–style)
- **Tech stack**: HTML5 Canvas, vanilla JavaScript, CSS3
- **Brand**: Vitrac (heromea.com) – jam/preserve products

---

## Core Gameplay

### Player

- **Ship**: Spaceship sprite at bottom of screen
- **Movement**: Left/right only (Arrow keys or touch)
- **Shooting**: Bullets upward (SPACE or tap top area)
- **Size**: 60x50 base, scales with viewport
- **Speed**: 5 (base), scaled by device
- **Lives**: 3

### Enemies (Fruit Types)

- **Types**: Strawberry, Blueberry, Mango (one type per level)
- **Formation**: Grid, rows/cols increase with level
- **Movement**: Horizontal back-and-forth, step down when hitting edges
- **Fire**: Shoot seeds at player (random interval 120–180 frames, faster at higher levels)
- **Seed colors**: Strawberry (#8B4513), Blueberry (#2962ff), Mango (#ffca28)

### Level Progression

- **Levels**: 1–10
- **Per level**: Same fruit type; grid size and difficulty increase
- **Grid**: 2–6 rows, 4–10 cols (based on level)
- **Win condition**: Clear all 10 levels
- **Transition**: 2s “Level X Complete” message between levels

### Difficulty Scaling

- Enemy speed: 0.5 + (level-1) * 0.15
- Shoot interval: 180 frames down to 60 (faster at higher levels)
- Seed speed: 3 + (level-1) * 0.3
- Score per kill: 10 * currentLevel

---

## Controls


| Input              | Action                                                                           |
| ------------------ | -------------------------------------------------------------------------------- |
| Arrow Left         | Move left                                                                        |
| Arrow Right        | Move right                                                                       |
| SPACE              | Shoot                                                                            |
| **Touch (mobile)** | Left half = move left; Right half = move right; Top 40% = shoot (150ms cooldown) |


---

## Scoring and Rewards

- **Points**: 10 × level per enemy destroyed
- **High score**: Local storage, persisted
- **Coupon**: New high score → Vitrac coupon (VITRAC20, VITRAC25, VITRAC30, VITRAC35 by score tier)
- **Leaderboard**: Top 100, Supabase-backed; auto-save on game over

---

### Visual Theme

- Dark background (#0a0a2e–#16213e)
- Cyan accent (#00ffff)
- Product links to heromea.com Vitrac product pages

---

## Assets


| Asset                                                    | Purpose              |
| -------------------------------------------------------- | -------------------- |
| `strawberry.png`, `blueberry.png`, `mango.png`           | Enemy sprites        |
| `spaceship.png`                                          | Player ship          |
| `bullet.png`                                             | Player bullets       |
| `background.png`                                         | Game background      |
| `logo-vitrac.png`                                        | Header logo          |
| `Asmaa.png`                                              | Start screen avatar  |
| `Raspberry_1.png`, `Mango_1_0.png`, `Carrot_1.png`, etc. | Product panel images |


---

## Backend / Data

### Leaderboard (Supabase)

- **Table**: `high_scores` (id, player_name, score, created_at, updated_at)
- **API**: REST, anon key; config in `config.js` (not committed)
- **Flow**: Auto-save score on game over; fetch top 100 for display
- **RLS**: Public read (SELECT), public insert (INSERT)

### Config

- `config.example.js` → `config.js` with `supabaseUrl` and `supabaseKey`

