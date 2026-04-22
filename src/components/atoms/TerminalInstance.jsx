import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalInstance = ({ onMount, onKey, fontSize = 14, theme = 'default' }) => {
    const ref = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);

    const themes = {
        default: { background: '#000', foreground: '#ff4500' },
        matrix: { background: '#000', foreground: '#00ff00' },
        ocean: { background: '#0f172a', foreground: '#38bdf8' },
        sunset: { background: '#1a1a1a', foreground: '#f97316' },
    };

    useEffect(() => {
        if (!ref.current) return;

        if (xtermRef.current) {
            xtermRef.current.dispose();
        }

        const xterm = new XTerm({
            theme: themes[theme] || themes.default,
            fontSize,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            cursorBlink: true,
            allowTransparency: true
        });
        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);

        xterm.open(ref.current);
        try {
            fitAddon.fit();
        } catch (e) { console.warn("Fit failed on init", e); }

        xtermRef.current = xterm;
        fitAddonRef.current = fitAddon;

        if (onMount) onMount(xterm);
        if (onKey) xterm.onKey(onKey);

        const handleResize = () => {
            try {
                fitAddon.fit();
            } catch (e) { }
        };
        window.addEventListener('resize', handleResize);

        setTimeout(() => {
            try {
                fitAddon.fit();
            } catch (e) { }
        }, 100);

        return () => {
            xterm.dispose();
            window.removeEventListener('resize', handleResize);
        };
    }, [fontSize, theme]);

    return <div ref={ref} className="w-full h-full bg-black/90" style={{ minHeight: '100px', minWidth: '100px' }} />;
};

export default TerminalInstance;
