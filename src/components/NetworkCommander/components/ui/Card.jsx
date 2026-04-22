import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Card = ({ className, children, ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
            'rounded-xl border border-white/5 bg-secondary/50 backdrop-blur-xl shadow-2xl overflow-hidden',
            className
        )}
        {...props}
    >
        {children}
    </motion.div>
);

export const CardHeader = ({ className, children, ...props }) => (
    <div className={cn('p-6', className)} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ className, children, ...props }) => (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight text-white', className)} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ className, children, ...props }) => (
    <div className={cn('p-6 pt-0', className)} {...props}>
        {children}
    </div>
);
