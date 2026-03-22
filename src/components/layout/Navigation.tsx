'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/', label: 'Cockpit', icon: '⬡', shortLabel: 'Home' },
    { href: '/mission', label: 'Mission', icon: '◈', shortLabel: 'Mission' },
    { href: '/schedule', label: 'Schedule', icon: '◫', shortLabel: 'Schedule' },
    { href: '/stats', label: 'Stats', icon: '◆', shortLabel: 'Stats' },
    { href: '/parking-lot', label: 'Parking Lot', icon: '◇', shortLabel: 'Parking Lot' },
    { href: '/calm', label: 'Calm Mode', icon: '○', shortLabel: 'Calm' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 border-r border-cr-border bg-cr-bg/50 backdrop-blur-sm h-screen sticky top-0">
            {/* Logo */}
            <div className="p-5 border-b border-cr-border">
                <h1 className="font-mono text-sm font-bold tracking-widest text-cr-accent uppercase">
                    ⬡ Cockpit
                </h1>
                <p className="font-mono text-[10px] text-cr-text-muted mt-1 tracking-wider">
                    COMMAND CENTER v1.0
                </p>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2.5 font-mono text-xs',
                                'transition-all duration-200',
                                isActive
                                    ? 'bg-cr-accent-muted text-cr-accent border border-cr-accent-dim shadow-[0_0_10px_rgba(62,207,90,0.08)]'
                                    : 'text-cr-text-secondary hover:bg-cr-panel hover:text-cr-text border border-transparent'
                            )}
                        >
                            <span className="text-base">{item.icon}</span>
                            <span className="tracking-wider uppercase">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings link */}
            <div className="p-3 border-t border-cr-border">
                <Link
                    href="/settings"
                    className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 font-mono text-xs',
                        'transition-all duration-200',
                        pathname === '/settings'
                            ? 'bg-cr-accent-muted text-cr-accent'
                            : 'text-cr-text-muted hover:text-cr-text-secondary'
                    )}
                >
                    <span className="text-base">⚙</span>
                    <span className="tracking-wider uppercase">Settings</span>
                </Link>
            </div>
        </aside>
    );
}

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-cr-border bg-cr-bg/90 backdrop-blur-md">
            {NAV_ITEMS.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex flex-1 flex-col items-center gap-0.5 py-2 font-mono text-[10px]',
                            'transition-all duration-200',
                            isActive ? 'text-cr-accent' : 'text-cr-text-muted'
                        )}
                    >
                        <span className={cn('text-lg', isActive && 'drop-shadow-[0_0_6px_rgba(62,207,90,0.4)]')}>
                            {item.icon}
                        </span>
                        <span className="uppercase tracking-wider">{item.shortLabel}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
