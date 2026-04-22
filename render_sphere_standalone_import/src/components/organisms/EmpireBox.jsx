import React, { useState } from 'react';
import { Info } from 'lucide-react';

// Empire Design System Themes
const THEMES = {
    emerald: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-black/80 text-emerald-100',
    ruby: 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] bg-black/80 text-rose-100',
    void: 'border-slate-700 shadow-[0_0_15px_rgba(148,163,184,0.1)] bg-gray-950/90 text-slate-300',
    gold: 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-black/80 text-amber-100',
    cyan: 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-black/80 text-cyan-100',
};

const EmpireBox = React.forwardRef(({
    children,
    title,
    description, // New prop for tooltip content
    theme = 'void',
    width = 'w-64',
    height = 'h-64',
    className = '',
    style,
    onMouseDown,
    onMouseUp,
    onTouchEnd,
    ...props
}, ref) => {
    const themeClasses = THEMES[theme] || THEMES.void;
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            ref={ref}
            style={style}
            className={`relative flex flex-col rounded-lg border ${themeClasses} backdrop-blur-md overflow-hidden transition-colors duration-300 ${className}`}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            {...props}
        >
            {/* Header / Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-inherit bg-white/5 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2 pointer-events-auto">
                    <span className="text-xs font-bold tracking-widest uppercase opacity-80 select-none">{title}</span>
                    
                    {/* Tooltip Trigger */}
                    {description && (
                        <div 
                            className="relative flex items-center"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                        >
                            <Info size={12} className="opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                            
                            {/* Tooltip Content */}
                            {showTooltip && (
                                <div className="absolute left-0 top-full mt-2 w-48 z-50 p-2 bg-black/90 border border-white/20 rounded shadow-xl backdrop-blur-xl text-[10px] leading-relaxed text-white animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
                                    <div className="absolute -top-1 left-1 w-2 h-2 bg-black border-l border-t border-white/20 transform rotate-45" />
                                    {description}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-1 pointer-events-none">
                    <div className={`w-1.5 h-1.5 rounded-full ${theme === 'emerald' ? 'bg-emerald-400' : 'bg-current opacity-50'}`} />
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                </div>
            </div>

            {/* Content Area */}
            <div
                className="flex-1 p-4 overflow-auto scrollbar-hide"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {children}
            </div>

            {/* Resize Handle */}
            <div className="absolute bottom-1 right-1 opacity-20 cursor-se-resize pointer-events-none">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" className="w-3 h-3">
                    <path d="M10 10L10 0L0 10Z" />
                </svg>
            </div>
        </div>
    );
});

EmpireBox.displayName = 'EmpireBox';

export default EmpireBox;
