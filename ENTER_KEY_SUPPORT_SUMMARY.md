# Added Keyboard Control for "The Swarm"

## Improvement
The user reported "hitting enter" expecting the bot to start, but there was no reaction. The button might also be visually elusive in the complex grid.

## Solution
Implemented a global keyboard listener in the `BotControlBox`.

### Changes to `src/components/MirrorBot/components/organisms/Gemini_Strategies.jsx`
- Added an effect that listens for the `Enter` key.
- When `Enter` is pressed, it triggers `toggleSwarm()`, effectively clicking the "Initialize Swarm" button programmatically.
- Updated the button label to `Initialize Swarm [ENTER]` to give visual feedback about this shortcut.

## Outcome
Usage is now intuitive for power users:
- **Press ENTER:** Swarm activates (ONLINE).
- **Press ENTER again:** Swarm deactivates (OFFLINE).

The "Legion Control" box also now explicitly displays `[PRESS ENTER]` in its description header.
