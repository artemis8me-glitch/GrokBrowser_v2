import { clsx } from 'clsx';
import { cn } from '../../lib/utils';

const Badge = ({ children, color = "blue", className = "", icon: Icon }) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        gold: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        platinum: "bg-slate-200/10 text-slate-200 border-slate-200/20",
    };
    return (
        <span className={cn(`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border flex items-center gap-1 w-fit ${colors[color]}`, className)}>
            {Icon && <Icon size={10} />}
            {children}
        </span>
    );
};

export { Badge };
