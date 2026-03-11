'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { settingsRepository } from '@/lib/repositories/SettingsRepository';
import type { UserSettings } from '@/lib/models';
import { cn } from '@/lib/utils';

const CRT_LABELS: Record<number, string> = {
    0: 'Off',
    1: 'Subtle',
    2: 'Medium',
    3: 'Maximum',
};

export default function SettingsPage() {
    const { showToast } = useToast();
    const [settings, setSettings] = useState<UserSettings | null>(null);

    const loadSettings = useCallback(async () => {
        const s = await settingsRepository.get();
        setSettings(s);
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const updateScanlineLevel = async (level: number) => {
        await settingsRepository.update({ scanlineLevel: level });
        setSettings(prev => prev ? { ...prev, scanlineLevel: level } : prev);

        // Apply immediately: remove all crt- classes, then add new one
        const root = document.querySelector('.flex.min-h-screen');
        if (root) {
            root.classList.remove('crt-1', 'crt-2', 'crt-3');
            if (level > 0) root.classList.add(`crt-${level}`);
        }

        showToast(`CRT effect: ${CRT_LABELS[level]}`);
    };

    const toggleReduceMotion = async (value: boolean) => {
        await settingsRepository.update({ reduceMotion: value });
        setSettings(prev => prev ? { ...prev, reduceMotion: value } : prev);
        document.querySelector('.flex.min-h-screen')?.classList.toggle('reduce-motion', value);
        showToast(`Reduce motion ${value ? 'enabled' : 'disabled'}`);
    };

    if (!settings) return null;

    const scanlineLevel = settings.scanlineLevel ?? 0;

    return (
        <div className="space-y-4">
            <h1 className="font-mono text-lg font-bold text-cr-text uppercase tracking-wider">Settings</h1>

            <Panel title="Display" glow>
                <div className="space-y-6">
                    {/* CRT Scanlines Slider */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm text-cr-text">CRT Scanlines</p>
                                <p className="text-xs text-cr-text-muted">Old terminal-style scanlines with screen flicker</p>
                            </div>
                            <span className={cn(
                                'font-mono text-xs font-bold px-2 py-0.5 rounded-full border',
                                scanlineLevel === 0
                                    ? 'text-cr-text-muted border-cr-border'
                                    : 'text-cr-accent border-cr-accent-dim bg-cr-accent-muted'
                            )}>
                                {CRT_LABELS[scanlineLevel]}
                            </span>
                        </div>

                        {/* Custom step slider */}
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type="range"
                                    min={0}
                                    max={3}
                                    step={1}
                                    value={scanlineLevel}
                                    onChange={(e) => updateScanlineLevel(parseInt(e.target.value))}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-cr-border
                                        [&::-webkit-slider-thumb]:appearance-none
                                        [&::-webkit-slider-thumb]:h-5
                                        [&::-webkit-slider-thumb]:w-5
                                        [&::-webkit-slider-thumb]:rounded-full
                                        [&::-webkit-slider-thumb]:bg-cr-accent
                                        [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(62,207,90,0.3)]
                                        [&::-webkit-slider-thumb]:cursor-pointer
                                        [&::-webkit-slider-thumb]:transition-shadow
                                        [&::-webkit-slider-thumb]:duration-200
                                        [&::-webkit-slider-thumb]:hover:shadow-[0_0_15px_rgba(62,207,90,0.5)]
                                        [&::-moz-range-thumb]:h-5
                                        [&::-moz-range-thumb]:w-5
                                        [&::-moz-range-thumb]:rounded-full
                                        [&::-moz-range-thumb]:bg-cr-accent
                                        [&::-moz-range-thumb]:border-none
                                        [&::-moz-range-thumb]:cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, var(--color-cr-accent-dim) 0%, var(--color-cr-accent-dim) ${(scanlineLevel / 3) * 100}%, var(--color-cr-border) ${(scanlineLevel / 3) * 100}%, var(--color-cr-border) 100%)`,
                                    }}
                                />
                                {/* Step markers */}
                                <div className="flex justify-between mt-1.5 px-0.5">
                                    {[0, 1, 2, 3].map((step) => (
                                        <button
                                            key={step}
                                            onClick={() => updateScanlineLevel(step)}
                                            className={cn(
                                                'font-mono text-[10px] transition-colors cursor-pointer',
                                                scanlineLevel === step
                                                    ? 'text-cr-accent font-bold'
                                                    : 'text-cr-text-muted hover:text-cr-text-secondary'
                                            )}
                                        >
                                            {step}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-cr-border" />

                    {/* Reduce Motion */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-cr-text">Reduce Motion</p>
                            <p className="text-xs text-cr-text-muted">Disable animations and transitions</p>
                        </div>
                        <button
                            onClick={() => toggleReduceMotion(!settings.reduceMotion)}
                            className={cn(
                                'relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer',
                                settings.reduceMotion ? 'bg-cr-accent' : 'bg-cr-border'
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200',
                                    settings.reduceMotion && 'translate-x-5'
                                )}
                            />
                        </button>
                    </div>
                </div>
            </Panel>

            <Panel title="Keyboard Shortcuts" glow>
                <div className="space-y-2">
                    <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-cr-text-secondary">New task</span>
                        <kbd className="rounded border border-cr-border bg-cr-bg px-2 py-0.5 font-mono text-xs text-cr-text">N</kbd>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-cr-text-secondary">Search Parking Lot</span>
                        <kbd className="rounded border border-cr-border bg-cr-bg px-2 py-0.5 font-mono text-xs text-cr-text">/</kbd>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-cr-text-secondary">Close modal / exit emergency</span>
                        <kbd className="rounded border border-cr-border bg-cr-bg px-2 py-0.5 font-mono text-xs text-cr-text">Esc</kbd>
                    </div>
                </div>
            </Panel>

            <Panel title="Data" glow>
                <div className="space-y-3">
                    <p className="text-xs text-cr-text-muted">
                        All data is stored locally in your browser using IndexedDB. No data is sent to any server.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={async () => {
                                if (window.confirm('This will delete ALL your data. Are you sure?')) {
                                    const { db } = await import('@/lib/db/database');
                                    await db.delete();
                                    window.location.reload();
                                }
                            }}
                        >
                            Reset All Data
                        </Button>
                    </div>
                </div>
            </Panel>

            <Panel title="About" glow>
                <div className="space-y-2 text-xs text-cr-text-muted">
                    <p><span className="text-cr-accent">Cockpit</span> v1.0.0</p>
                    <p>A Matrix-inspired offline-first planning dashboard.</p>
                    <p className="font-mono text-[10px] text-cr-text-muted/50">
                        Future: Firebase integration, cloud sync, auth
                    </p>
                </div>
            </Panel>
        </div>
    );
}
