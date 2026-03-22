'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { EventFormModal } from '@/components/calendar/EventFormModal';
import { useToast } from '@/components/ui/Toast';
import { calendarEventRepository } from '@/lib/repositories/CalendarEventRepository';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import { objectiveRepository } from '@/lib/repositories/ObjectiveRepository';
import type { CalendarEvent, Task, Objective } from '@/lib/models';

type ViewMode = 'month' | 'week' | 'day';

const VIEW_TABS = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
];

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonthLabel(year: number, month: number): string {
    return new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getWeekLabel(weekStart: Date): string {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} – ${endLabel}`;
}

export default function SchedulePage() {
    const { showToast } = useToast();
    const [view, setView] = useState<ViewMode>('month');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [deadlines, setDeadlines] = useState<(Task | Objective)[]>([]);

    // Navigation state
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(today));
    const [currentDay, setCurrentDay] = useState(formatDateStr(today));

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
    const [defaultDate, setDefaultDate] = useState<string | undefined>();

    const loadEvents = useCallback(async () => {
        // Load all events for current view range
        let start: string, end: string;

        if (view === 'month') {
            start = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
            end = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${lastDay}`;
        } else if (view === 'week') {
            start = formatDateStr(currentWeekStart);
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            end = formatDateStr(weekEnd);
        } else {
            start = currentDay;
            end = currentDay;
        }

        const data = await calendarEventRepository.getByDateRange(start, end);
        setEvents(data);

        // Load tasks/objectives with due dates in this range
        const [dueTasks, dueObjectives] = await Promise.all([
            taskRepository.getByDateRange(start, end),
            objectiveRepository.getByDateRange(start, end),
        ]);
        setDeadlines([...dueTasks, ...dueObjectives].filter(d => d.status !== 'archived'));
    }, [view, currentYear, currentMonth, currentWeekStart, currentDay]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Navigation handlers
    const navigatePrev = () => {
        if (view === 'month') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else if (view === 'week') {
            const prev = new Date(currentWeekStart);
            prev.setDate(prev.getDate() - 7);
            setCurrentWeekStart(prev);
        } else {
            const d = new Date(currentDay + 'T00:00:00');
            d.setDate(d.getDate() - 1);
            setCurrentDay(formatDateStr(d));
        }
    };

    const navigateNext = () => {
        if (view === 'month') {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        } else if (view === 'week') {
            const next = new Date(currentWeekStart);
            next.setDate(next.getDate() + 7);
            setCurrentWeekStart(next);
        } else {
            const d = new Date(currentDay + 'T00:00:00');
            d.setDate(d.getDate() + 1);
            setCurrentDay(formatDateStr(d));
        }
    };

    const navigateToday = () => {
        const t = new Date();
        setCurrentYear(t.getFullYear());
        setCurrentMonth(t.getMonth());
        setCurrentWeekStart(getWeekStart(t));
        setCurrentDay(formatDateStr(t));
    };

    const getPeriodLabel = (): string => {
        if (view === 'month') return getMonthLabel(currentYear, currentMonth);
        if (view === 'week') return getWeekLabel(currentWeekStart);
        return new Date(currentDay + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Event handlers
    const handleSave = async (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingEvent) {
            await calendarEventRepository.update(editingEvent.id, data);
            showToast('Event updated');
        } else {
            await calendarEventRepository.create(data);
            showToast('Event created');
        }
        setEditingEvent(undefined);
        loadEvents();
    };

    const handleDelete = async () => {
        if (editingEvent) {
            await calendarEventRepository.delete(editingEvent.id);
            showToast('Event deleted');
            setEditingEvent(undefined);
            setShowModal(false);
            loadEvents();
        }
    };

    const openNewEvent = (date?: string, time?: string) => {
        setEditingEvent(undefined);
        setDefaultDate(date || currentDay);
        setShowModal(true);
    };

    const openEditEvent = (event: CalendarEvent) => {
        setEditingEvent(event);
        setShowModal(false);
        // small delay so modal transition works
        setTimeout(() => setShowModal(true), 50);
    };

    const handleDayClick = (dateStr: string) => {
        setCurrentDay(dateStr);
        setView('day');
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Panel className="!p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-cr-accent font-bold tracking-widest uppercase">
                            ◫ Schedule
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Tabs
                            tabs={VIEW_TABS}
                            activeTab={view}
                            onChange={(id) => setView(id as ViewMode)}
                        />
                    </div>
                </div>
            </Panel>

            {/* Navigation */}
            <Panel className="!p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={navigatePrev}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-cr-border text-cr-text-secondary hover:bg-cr-panel-hover hover:text-cr-text hover:border-cr-border-hover transition-all cursor-pointer font-mono text-xs"
                        >
                            ‹
                        </button>
                        <button
                            onClick={navigateNext}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-cr-border text-cr-text-secondary hover:bg-cr-panel-hover hover:text-cr-text hover:border-cr-border-hover transition-all cursor-pointer font-mono text-xs"
                        >
                            ›
                        </button>
                        <button
                            onClick={navigateToday}
                            className="px-2.5 py-1 rounded-md border border-cr-border text-cr-text-secondary hover:bg-cr-panel-hover hover:text-cr-text hover:border-cr-border-hover transition-all cursor-pointer font-mono text-[10px] uppercase tracking-wider"
                        >
                            Today
                        </button>
                    </div>

                    <h2 className="font-mono text-sm font-semibold text-cr-text tracking-wide">
                        {getPeriodLabel()}
                    </h2>

                    <Button size="sm" variant="primary" onClick={() => openNewEvent()}>
                        + New Event
                    </Button>
                </div>
            </Panel>

            {/* View content */}
            <Panel glow>
                {view === 'month' && (
                    <CalendarGrid
                        year={currentYear}
                        month={currentMonth}
                        events={events}
                        onDayClick={handleDayClick}
                    />
                )}
                {view === 'week' && (
                    <WeekView
                        weekStart={currentWeekStart}
                        events={events}
                        onEventClick={openEditEvent}
                        onSlotClick={(date, time) => openNewEvent(date, time)}
                    />
                )}
                {view === 'day' && (
                    <DayView
                        date={currentDay}
                        events={events}
                        deadlines={deadlines.filter(d => (d as any).dueDate === currentDay)}
                        onEventClick={openEditEvent}
                        onAddClick={() => openNewEvent(currentDay)}
                    />
                )}
            </Panel>

            {/* Event Form Modal */}
            <EventFormModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingEvent(undefined);
                }}
                onSave={handleSave}
                onDelete={editingEvent ? handleDelete : undefined}
                initialData={editingEvent}
                defaultDate={defaultDate}
            />
        </div>
    );
}
