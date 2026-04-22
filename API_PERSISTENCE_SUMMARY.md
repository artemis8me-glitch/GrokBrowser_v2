# API Key Persistence Upgrade

## Improvement
User requested assurance that their API key will remain permanent after a refresh.

## Implementation
Updated `src/AiTerminal.jsx` with enhanced persistence logic:
1.  **Redundant Store:** Added a specific `useEffect` that forces `localStorage.setItem` whenever `apiKey` state changes.
2.  **Environment Backup:** Added logic to check `import.meta.env.VITE_VERTEX_KEY` (and others) on load. This allows Hardcoding keys in a `.env` file for absolute permanence if desired.
3.  **Priority Loading:** Checks Local Storage -> Env Vars -> Backend Config in order.

## Outcome
- The key entered in the UI will now definitely survive page refreshes.
- If the user wants to survive "Clear Cache", they can add `VITE_VERTEX_KEY=...` to a `.env` file.
