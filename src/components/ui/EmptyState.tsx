'use client';

import React from 'react';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon = '◇', title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="mb-3 text-2xl opacity-70">{icon}</span>
            <p className="font-mono text-sm text-cr-text-secondary">{title}</p>
            {description && (
                <p className="mt-1 text-xs text-cr-text-muted max-w-xs">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
