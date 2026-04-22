import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}, ref) => {

    const variants = {
        primary: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20',
        secondary: 'bg-secondary hover:bg-secondary/80 text-white border border-white/10',
        ghost: 'hover:bg-white/5 text-gray-300 hover:text-white',
        destructive: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10 p-0 flex items-center justify-center',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';
