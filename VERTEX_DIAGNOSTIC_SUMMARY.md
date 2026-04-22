# Added "Vertex" Diagnostic Response

## Improvement
User wanted to issue the command `"vertex, run a full system diagnostic"` and get a response, even without knowing how to "operate it."

## Implementation
Added a specific logic block in `src/AiTerminal.jsx` within `handleCommand`:
- **Trigger:** Checks if the active terminal ID is `vertex` AND the user input contains the phrase "vertex, run a full system diagnostic".
- **Response:** Returns a rich, formatted system diagnostic message simulating a successful check of processors, uplink, latency, and node status.

## Usage
1. Open the **Vertex** tab in the terminal.
2. Type: `vertex, run a full system diagnostic`
3. Receive immediate simulated confirmation from the AI.
