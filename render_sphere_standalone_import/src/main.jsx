import { EmpireEngine } from './engine/Empire3D.js';
import { SystemState } from './system/State.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import EmpireIDE from './components/EmpireIDE.jsx'; // Adjust path if needed

// Boot Sequence
window.addEventListener('DOMContentLoaded', () => {
    const engine = new EmpireEngine();
    const system = new SystemState(engine);
    
    system.boot();

    // Mount EmpireIDE
    const ideRoot = document.getElementById('empire-ide-root');
    const ideToggle = () => {
        if (ideRoot.style.display === 'none' || ideRoot.style.display === '') {
            ideRoot.style.display = 'flex'; // Use flex for internal layout
        } else {
            ideRoot.style.display = 'none';
        }
    };
    ReactDOM.createRoot(ideRoot).render(<EmpireIDE />);

    // Bind global commands
    window.Empire = {
        save: () => system.saveSnapshot(),
        execute: (cmd) => system.execute(cmd),
        engine: engine,
        toggleIDE: ideToggle // Add toggle function
    };
});

