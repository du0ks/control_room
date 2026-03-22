import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
    return uuidv4();
}

export function now(): number {
    return Date.now();
}

export function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatDateShort(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export function todayString(): string {
    return new Date().toISOString().split('T')[0];
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function getAnxietyColor(score: number): string {
    if (score <= 3) return '#3ecf5a'; // Green
    if (score <= 6) return '#cfa63e'; // Yellow
    return '#cf3e3e'; // Red
}

export function formatDueDate(dateStr: string, view: 'today' | 'week' | 'month' | 'quarter'): string {
    const d = new Date(dateStr + 'T00:00:00');
    switch (view) {
        case 'today':
            return '';
        case 'week':
            return d.toLocaleDateString('en-GB', { weekday: 'long' });
        case 'month':
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        case 'quarter':
            return d.toLocaleDateString('en-GB', { month: 'long' });
        default:
            return '';
    }
}
