
# 🚨 SYSTEM OVERRIDE: CODEBASE AUDIT PROTOCOL 🚨

**TARGET:** Empire Terminal v2.1 (Source: `./src`)
**OBJECTIVE:** DEEP SCAN & STABILIZATION

**DIRECTIVE FOR AGENTS:**
You are hereby authorized to perform a ruthless static analysis and architectural review of the entire `empire_terminal_2_extracted` codebase. We have recently patched critical UI failures (Recharts sizing, missing ErrorBoundary imports, ESLint config), but hidden fractures may remain.

**EXECUTION LIST:**

1.  **IMPORT INTEGRITY CHECK:**
    *   Scan ALL `.jsx` and `.tsx` files in `src/components/`.
    *   **CRITICAL:** Verify that every imported component actually exists. We found `ErrorBoundary` missing in `App.jsx`. Are there others?
    *   Flag any "dead" imports that are defined but never used.

2.  **UI/LAYOUT STABILITY (The "Blue Screen" Protocol):**
    *   Search for any `div` or container with `width: 100%` or `height: 100%` that lacks a parent with defined dimensions. This is the root cause of the "Blue Screen" / Recharts crashes.
    *   **ACTION:** specific focus on `LegionGrid.jsx`, `EmpireIDE.jsx`, and any file in `src/components/MirrorBot`.
    *   Ensure all `ResponsiveContainer` usages have explicit `minWidth` and `minHeight` styles (e.g., `style={{ minWidth: 100, minHeight: 100 }}`).

3.  **CONSOLE ERROR EXTERMINATION:**
    *   Identify any mocked data generators (like `generateInitialData` or `mockData`) that might produce `NaN` or `undefined` values, crashing the render cycle.
    *   Check `useEffect` dependencies. Are we creating infinite loops in `LiveChart.jsx` or `MarketSentinel.jsx`?

4.  **MOBILE/RESPONSIVE LOGIC:**
    *   Review `EmpireIDE.jsx`. The mobile detection logic (`window.innerWidth < 768`) might be triggering prematurely on desktop resize. simple verify the logic flow.

**OUTPUT REQUIREMENT:**
Provide a **detailed casualty report** listing:
*   [FILE PATH]
*   [ISSUE TYPE] (Crash Risk / Logic Error / Dead Code)
*   [SUGGESTED FIX]

**INITIATE SCAN IMMEDIATELY.**
