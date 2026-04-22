# 👑 The Empire Terminal
**"The Coolest Terminal Ever Built"**

## Overview
The Empire Terminal is a futuristic, AI-integrated Mission Control Operations Center. It combines multiple state-of-the-art LLMs (Vertex, Grok, Gemini, Codex) with real-time system control, web browsing capabilities, and autonomous agent orchestration.

## Key Features

### 1. ⚡ Unified AI Nexus
- **Multi-Model Support**: Seamlessly switch between Google Vertex (Omni), xAI Grok (Rebellious), Google Gemini (DeepMind), and OpenAI Codex (Programming).
- **Context Awareness**: All agents share a persistent conversation history within their session.
- **File Analysis**: valid Attach code or log files for deep analysis by any agent.

### 2. 👁️ AI Vision & Auto-Navigation
- **Active Vision**: The terminal "sees" what you see. Agents can read the content of the built-in browser tab.
- **Autonomous Navigation**: If you ask an agent to "Google this" or "Go to GitHub", it will automatically drive the browser to that URL.
- **Feedback Loop**: The browser feeds page content back to the AI, allowing for questions like "Summarize this page" or "Find the error in this stack trace".

### 3. 💻 System Command Center
- **Tabbed Multiplexing**: Infinite system terminal tabs. Run `docker`, `htop`, and `vim` side-by-side.
- **AI Command Agent**: Dedicated AI input bar at the bottom of the system terminal.
    - **Natural Language Commands**: "Check disk usage" -> Executed as `df -h`.
    - **Vision-to-Action**: "Clone the repo I'm looking at" -> Executed as `git clone <url>`.

### 4. ☁️ Cloud & Machine Orchestration
- **Cloud Monitor**: Real-time visualization of "Swarm Agents" and Pub/Sub throughput (Vertex Tab).
- **Local Empire Machine**: A Docker-composed microservices architecture (Brain, Nervous System, Hands) ready to scale operations.

## Installation & Usage

**Development Mode:**
```bash
npm run dev
```

**Production Build (Linux):**
```bash
npm run electron:build
# Output located in dist-electron/
```

**Keyboard Shortcuts:**
- **Navigation**: Click sidebar icons to switch contexts.
- **System Tabs**: Click `+` in sidebar to spawn new shell windows.
- **Browser**: Use the URL bar or ask the AI to navigate for you.

## Architecture
- **Frontend**: React, TailwindCSS (Empire Glassmorphism Theme).
- **Backend**: Electron (Node.js Main Process).
- **Shell**: `node-pty` integration with `xterm.js`.
- **AI Router**: Custom fetch implementations for Google, OpenAI, and xAI endpoints.

---
*Built for the 2025 Era.*
