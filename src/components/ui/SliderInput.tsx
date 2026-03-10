'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface SliderInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    className?: string;
}

export function SliderInput({
    value,
    onChange,
    min = 1,
    max = 10,
    label,
    showValue = true,
    className,
}: SliderInputProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <label className="font-mono text-xs font-medium uppercase tracking-wider text-cr-text-secondary">
                            {label}
                        </label>
                    )}
                    {showValue && (
                        <span className="font-mono text-lg font-bold text-cr-accent">{value}</span>
                    )}
                </div>
            )}
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
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
                        background: `linear-gradient(to right, var(--color-cr-accent-dim) 0%, var(--color-cr-accent-dim) ${percentage}%, var(--color-cr-border) ${percentage}%, var(--color-cr-border) 100%)`,
                    }}
                />
                <div className="flex justify-between mt-1 px-1">
                    <span className="text-[10px] text-cr-text-secondary font-mono">{min}</span>
                    <span className="text-[10px] text-cr-text-secondary font-mono">{max}</span>
                </div>
            </div>
        </div>
    );
}
