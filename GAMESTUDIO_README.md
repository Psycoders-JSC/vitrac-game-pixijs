# Game Studio Sub-Agents – Vitrac Integration

This project integrates the [Game Studio Sub-Agents](https://github.com/pamirtuna/gamestudio-subagents) from [pamirtuna/gamestudio-subagents](https://github.com/pamirtuna/gamestudio-subagents), adapted for **PixiJS** and the **Vitrac** game.

## What’s Included

- **12 specialized AI agents** for game development
- **PixiJS-specific agent variants** for mechanics, game feel, technical art, UI/UX, and QA
- **Engine configuration** for PixiJS (`engine_configs/pixijs_config.json`)
- **Project configuration** (`project-config.json`)
- **Documentation structure** (`documentation/`, `resources/`, `qa/`)
- **Cursor rule** (`.cursor/rules/gamestudio.mdc`) so the AI can use these agents

## Agent Overview

| Agent | Role |
|-------|------|
| **Master Orchestrator** | Project init, workflow, coordination |
| **Producer Agent** | Production, milestones, validation |
| **Market Analyst** | Market research, competitors, Go/No‑Go |
| **Data Scientist** | Metrics, analytics, A/B tests |
| **Sr Game Designer** | Vision, GDD, design pillars |
| **Mid Game Designer** | Content, feature specs, user stories |
| **Mechanics Developer** | Core systems, architecture |
| **Game Feel Developer** | Polish, juice, feedback |
| **Sr Game Artist** | Art direction, style guide |
| **Technical Artist** | Shaders, VFX, optimization |
| **UI/UX Agent** | UI design, flows, accessibility |
| **QA Agent** | Testing, performance, quality gates |

## Using Agents in Cursor

Reference the agents in your prompts:

```
Read agents/mechanics_developer_pixi.md and project-config.json.
Implement [feature] following the architecture in src/engine/.
```

```
Read agents/sr_game_designer.md and agents/mid_game_designer.md.
Create a design doc for [system] in documentation/design/.
```

```
Read agents/qa_agent_pixi.md.
Create a test plan for [feature] in qa/.
```

## Project Layout

```
vitrac-game pixi js/
├── agents/                  # AI agent definitions
│   ├── *_pixi.md           # PixiJS-specific variants
│   └── *.md                # Base agents
├── engine_configs/
│   └── pixijs_config.json  # PixiJS engine config
├── project-config.json     # Project metadata
├── documentation/
│   ├── design/             # GDD, systems, mechanics
│   ├── art/                # Style guide, concepts
│   └── production/         # Timeline, milestones
├── resources/
│   └── market-research/    # Market and competitor analysis
├── qa/                     # Test plans, bug reports
├── .cursor/rules/
│   └── gamestudio.mdc      # Cursor integration
└── src/                    # Game source (unchanged)
```

## Updating from Upstream

To refresh from the upstream repo:

```bash
git clone https://github.com/pamirtuna/gamestudio-subagents.git /tmp/gamestudio-subagents
# Copy agents/*.md as needed (except *_pixi.md, which are project-specific)
```

## Attribution

- **Game Studio Sub-Agents**: [pamirtuna/gamestudio-subagents](https://github.com/pamirtuna/gamestudio-subagents) by [Tuna Pamir](https://github.com/pamirtuna)
- **License**: MIT
