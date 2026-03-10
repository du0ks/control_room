'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface PanelProps {
    children: React.ReactNode;
    className?: string;
    title?: React.ReactNode;
    headerAction?: React.ReactNode;
    noPadding?: boolean;
    glow?: boolean;
}

export function Panel({ children, className, title, headerAction, noPadding, glow }: PanelProps) {
    return (
        <div
            className={cn(
                'rounded-md bg-cr-panel/70 backdrop-blur-sm',
                'transition-all duration-300',
                !noPadding && 'p-4',
                className
            )}
        >
            {(title || headerAction) && (
                <div className={cn('flex items-center justify-between', !noPadding && 'mb-3')}>
                    {title && (
                        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-cr-text-muted">
                            {title}
                        </h3>
                    )}
                    {headerAction}
                </div>
            )}
            {children}
        </div>
    );
}
