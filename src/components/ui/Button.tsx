'use client';

import { cn } from '@/lib/utils';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'emergency';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        'bg-cr-accent/10 border-cr-accent/30 text-cr-accent hover:bg-cr-accent/20 hover:border-cr-accent/50',
    secondary:
        'bg-transparent border-cr-border text-cr-text-secondary hover:bg-cr-panel/50 hover:text-cr-text hover:border-cr-border-hover',
    danger:
        'bg-transparent border-cr-danger/30 text-cr-danger hover:bg-cr-danger/10 hover:border-cr-danger/50',
    ghost:
        'bg-transparent border-transparent text-cr-text-secondary hover:bg-cr-panel/50 hover:text-cr-text',
    emergency:
        'bg-cr-danger/20 border-cr-danger text-cr-danger hover:bg-cr-danger/30',
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export function Button({
    variant = 'secondary',
    size = 'md',
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-md border font-mono font-medium',
                'transition-all duration-200 cursor-pointer',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
