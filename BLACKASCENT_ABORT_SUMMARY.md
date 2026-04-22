# BlackAscent Abort Protocol

## Improvement
User provided a critical "ABORT" command to stop the BlackAscent deployment and ensure no user data is touched.

## Implementation
Added a trigger for `blackascent abort --preserve-all` in `src/components/SystemTerminal.jsx`.
- **Response:**
  - `[VERTEX CORE] ABORT RECEIVED`
  - Explicit confirmation that preservation locks are engaged on Console, Command, Terminal, Webapp, and Mirrorr.
  - "DATA INTEGRITY SHIELD: ACTIVE"

## Usage
1. Open any **System Terminal**.
2. Type: `blackascent abort --preserve-all`.
3. Receive the safety confirmation.
