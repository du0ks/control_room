'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar, BottomNav } from './Navigation';
import { ToastProvider } from '@/components/ui/Toast';
import { seedDatabase } from '@/lib/db/seed';
import { settingsRepository } from '@/lib/repositories/SettingsRepository';
import type { UserSettings } from '@/lib/models';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function init() {
            await seedDatabase();
            const s = await settingsRepository.get();
            setSettings(s);
            setReady(true);
        }
        init();
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Skip if user is typing in an input/textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

            if (e.key === 'n') {
                // Dispatch custom event for "new task"
                window.dispatchEvent(new CustomEvent('cr:new-task'));
            }
            if (e.key === '/') {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('cr:search'));
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!ready) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="font-mono text-sm font-bold tracking-widest text-cr-accent animate-pulse uppercase">
                        ⬡ Initializing Cockpit...
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <ToastProvider>
            <div
                className={cn(
                    'flex min-h-screen',
                    settings?.scanlineLevel != null && settings.scanlineLevel > 0 ? `crt-${settings.scanlineLevel}` : false,
                    settings?.reduceMotion && 'reduce-motion'
                )}
            >
                <Sidebar />
                <main className="flex-1 min-h-screen pb-16 md:pb-0">
                    <div className="mx-auto max-w-6xl px-4 py-6">
                        {children}
                    </div>
                </main>
                <BottomNav />
            </div>
        </ToastProvider>
    );
}
