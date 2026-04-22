# 🚀 EMPIRE TERMINAL v2.5 (GOD MODE) - DEPLOYMENT GUIDE

This folder contains the standalone source code for the **Empire Terminal**.
You can drop these files into any React project (Vite/Next.js).

## 📂 CONTENTS

1.  `EmpireTerminal.jsx` - The core terminal component with God Mode, Auth, and Tabs.
2.  `GrokSession.jsx` - The xAI interface component.
3.  `USER_MANUAL.md` - The operator's handbook.
4.  `Assets` - Cinematic auth files (`traveler_cover.jpg`, `access_*.mp4`).

## 🛠️ INSTALLATION

1.  **Dependencies**: Ensure your project has `lucide-react` installed:
    ```bash
    npm install lucide-react
    ```

2.  **Copy Components**:
    Move `EmpireTerminal.jsx` and `GrokSession.jsx` into your `src/components/` folder.

3.  **Copy Assets**:
    Move the `.jpg` and `.mp4` files into your project's `public/` folder.
    *   `traveler_cover.jpg`
    *   `access_granted.mp4`
    *   `access_denied.mp4`

4.  **Import & Use**:
    ```jsx
    import EmpireTerminal from './components/EmpireTerminal';

    function App() {
      return (
        <div className="App">
          <EmpireTerminal onClose={() => console.log("Terminated")} />
        </div>
      );
    }
    ```

## 🔐 SECURITY NOTE
The default passphrase is set to **"Travelers"**. Search for this string in `EmpireTerminal.jsx` to change it.

> *"Property of The Empire. Handle with care."*
