# Game Studio Sub-Agents Directory

_From [pamirtuna/gamestudio-subagents](https://github.com/pamirtuna/gamestudio-subagents) - Adapted for Lion PixiJS Project_

## Agent Hierarchy

```
Master Orchestrator (System Controller)
 └── Producer Agent (Project Manager)
     ├── Market Analyst (Competitive Intelligence)
     ├── Data Scientist (Analytics & Metrics)
     ├── Sr Game Designer (Design Lead)
     │   └── Mid Game Designer (Content Creator)
     ├── Mechanics Developer (Core Systems)
     │   └── Game Feel Developer (Polish)
     ├── Sr Game Artist (Art Director)
     │   ├── Technical Artist (Implementation)
     │   └── UI/UX Agent (Interface)
     └── QA Agent (Quality Assurance)
```

## Active Agents

### Management Layer
- **master_orchestrator.md** - System coordinator and project initialization
- **producer_agent.md** - Project management and production control

### Intelligence Layer
- **market_analyst.md** - Competitive analysis and market intelligence
- **data_scientist.md** - Analytics, metrics, and predictive modeling

### Design Team
- **sr_game_designer.md** - Vision holder and systems architect
- **mid_game_designer.md** - Content creation and implementation specs

### Engineering Team 
- **mechanics_developer.md** - Core gameplay systems and architecture
- **game_feel_developer.md** - Polish, feedback, and game juice

### Art Team
- **sr_game_artist.md** - Art direction and visual style
- **technical_artist.md** - Shaders, VFX, and optimization
- **ui_ux_agent.md** - User interface and experience design

### Quality Assurance
- **qa_agent.md** - Testing, validation, and quality control

## Project: Lion (PixiJS)

This project uses **PixiJS v8** with TypeScript. When invoking agents:
- Read `project-config.json` and `engine_configs/pixijs_config.json` for context
- Adapt any engine-specific references (Godot/Unity/Unreal) to PixiJS equivalents
- See `.cursor/rules/gamestudio.mdc` for PixiJS adaptation guidelines

## Usage in Cursor

Invoke agents by referencing them in your prompts, e.g.:

```
Read agents/mechanics_developer.md and agents/mechanics_developer_pixi.md, 
then implement [feature] for this PixiJS project.
```

Or for design tasks:
```
Read agents/sr_game_designer.md and project-config.json.
Create a design doc for [system].
```
