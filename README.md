# The Last Ember

A browser-based 2D story-driven adventure game built with HTML, CSS, and JavaScript. The project is designed as a small, polished indie game experience with exploration, NPC dialogue, light combat, quests, a world map, inventory management, save/load support, and a mystery-heavy story.

## Overview

The player wakes in a strange village with no memory of who they are. A glowing relic, forgotten ruins, disappearing villagers, and an ancient force called The Ember all point to a truth the protagonist is not ready to face.

This game is structured as a playable vertical slice that can be expanded into a larger adventure while remaining lightweight enough to run directly in a browser.

## Core Features

- 2D side-view exploration and movement
- Story-focused quest progression
- Dialogue system with NPC interaction
- Light combat against creatures and bosses
- World map with travel and unlocked locations
- Inventory and item use
- Save and load using localStorage
- HUD with health, stamina, current objective, and notifications
- Several distinct regions with different moods and encounters
- Browser-based gameplay with no build step required

## Story Premise

The Last Ember follows a protagonist who wakes near Stoneford Village with no memory of their name, origin, or why they carry a glowing object that seems tied to a forgotten catastrophe.

As the player meets villagers, investigates the forest, explores ruins, and uncovers clues across the region, they gradually learn that the strange events are connected to an ancient power called The Ember. The deeper they go, the more they realize the protagonist's past is far more connected to the mystery than they ever imagined.

## World Areas

- Stoneford Village
- Whispering Forest
- Moonlit Lake
- Forgotten Ruins
- Old Mine
- Abandoned Watchtower
- Ember Mountain
- Final Ruins

## Main Gameplay Loop

1. Talk to villagers and accept quests
2. Explore the world and gather clues
3. Defeat enemies and survive hazards
4. Progress through story missions
5. Unlock new areas and travel points
6. Save progress and continue the adventure

## Controls

- Move: WASD or Arrow Keys
- Jump: Space
- Interact: E
- Attack: Left Mouse
- Pause: Esc
- Open Map: M
- Open Quest Menu: Q

## Project Structure

```text
2d-game/
├── index.html
├── style.css
├── js/
│   ├── main.js
│   ├── game.js
│   ├── player.js
│   ├── enemies.js
│   ├── combat.js
│   ├── camera.js
│   ├── world.js
│   ├── map.js
│   ├── quests.js
│   ├── dialogue.js
│   ├── inventory.js
│   ├── save.js
│   ├── audio.js
│   ├── ui.js
│   └── settings.js
├── assets/
│   ├── characters/
│   ├── environment/
│   ├── ui/
│   └── audio/
├── README.md
└── LICENSE
```

## Milestones

The game is planned in stages, beginning with a fully playable vertical slice:

1. Loading screen and main menu
2. Player movement and camera
3. Stoneford Village
4. NPC interaction and dialogue
5. Quest system
6. Combat and enemies
7. World map
8. Inventory and items
9. Save and load system
10. Additional areas
11. Boss fights
12. Final story and ending
13. Polishing, sound, and effects

## Run the Game

Because this is a front-end HTML/Canvas project, it can be run locally in a browser.

### Option 1: Python

```bash
cd c:/Users/hp/Documents/GitHub/2d-game
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2: Any local static server

You can also run the project using a simple static file server such as `npx serve` or a VS Code Live Server extension.

## Save System

The project uses localStorage to save:

- Player position
- Health and stamina
- Inventory and coins
- Completed quests
- Current mission
- NPC relationship progress
- Unlocked locations
- Story progress

## Audio and Asset Approach

The game includes a sound system designed to support later integration of:

- background music by area
- combat and UI sound effects
- NPC interaction audio
- item pickup and mission completion sounds

If external sounds are not available yet, the code should be structured so replacements can be added easily later.

## Design Goals

This project aims to feel like a compact indie 2D adventure rather than a simple demo. The focus is on:

- responsive controls
- readable UI
- clean world design
- meaningful story progression
- approachable exploration and combat
- polished presentation without excessive complexity

## License

This project is licensed under the MIT License unless otherwise stated. See the LICENSE file for more information.

## Notes

This repository is intended to serve as a complete game concept and implementation foundation for a small browser adventure. The first goal is to deliver a playable vertical slice that includes:

- loading screen
- main menu
- village area
- NPC interaction
- first quest
- forest exploration
- enemy encounter
- mission completion
- save game

Once that flow works reliably, the project can expand into the full multi-area story described above.
