'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import { objectiveRepository } from '@/lib/repositories/ObjectiveRepository';
import { categoryRepository } from '@/lib/repositories/CategoryRepository';
import type { Task, Objective, Category, TaskScope, ObjectiveScope } from '@/lib/models';
import { cn, formatDueDate } from '@/lib/utils';

type MissionView = 'today' | 'week' | 'month' | 'quarter';

const VIEW_TABS = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'quarter', label: 'Quarter' },
];

const RECOMMENDED: Record<MissionView, string> = {
    today: '~5',
    week: '~5',
    month: '1–3',
    quarter: '1–2',
};

// ── Progress Ring ────────────────────────────────────
function ProgressRing({ done, total, size = 28 }: { done: number; total: number; size?: number }) {
    const stroke = 2.5;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = total === 0 ? 0 : done / total;
    const offset = circumference * (1 - progress);

    return (
        <div className="flex items-center gap-2">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="var(--cr-border)"
                    strokeWidth={stroke}
                    fill="none"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="var(--cr-accent)"
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <span className="font-mono text-[10px] text-cr-text-secondary">
                {done}/{total}
            </span>
        </div>
    );
}

export default function MissionPage() {
    const { showToast } = useToast();
    const [view, setView] = useState<MissionView>('today');
    const [items, setItems] = useState<(Task | Objective)[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Quick capture state
    const [quickTitle, setQuickTitle] = useState('');

    // Modal state
    const [showAdd, setShowAdd] = useState(false);
    const [editItem, setEditItem] = useState<Task | Objective | null>(null);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const isTaskScope = view === 'today' || view === 'week';

    const loadData = useCallback(async () => {
        const [cats] = await Promise.all([categoryRepository.getAll()]);
        setCategories(cats);

        if (isTaskScope) {
            const tasks = await taskRepository.getByScope(view as TaskScope);
            setItems(tasks.filter(t => t.status !== 'archived'));
        } else {
            const objs = await objectiveRepository.getByScope(view as ObjectiveScope);
            setItems(objs.filter(o => o.status !== 'archived'));
        }
    }, [view, isTaskScope]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Keyboard shortcut listener
    useEffect(() => {
        const handler = () => setShowAdd(true);
        window.addEventListener('cr:new-task', handler);
        return () => window.removeEventListener('cr:new-task', handler);
    }, []);

    // ── CRUD ──
    const handleQuickCapture = async () => {
        if (!quickTitle.trim()) return;
        if (isTaskScope) {
            await taskRepository.create({ title: quickTitle.trim(), scope: view as TaskScope, status: 'open' });
        } else {
            await objectiveRepository.create({ title: quickTitle.trim(), scope: view as ObjectiveScope, status: 'open' });
        }
        setQuickTitle('');
        showToast('Added');
        loadData();
    };

    const handleAdd = async () => {
        if (!title.trim()) return;
        if (isTaskScope) {
            await taskRepository.create({
                title: title.trim(),
                scope: view as TaskScope,
                status: 'open',
                notes: notes || undefined,
                dueDate: dueDate || undefined,
                categoryId: categoryId || undefined,
            });
        } else {
            await objectiveRepository.create({
                title: title.trim(),
                scope: view as ObjectiveScope,
                status: 'open',
                notes: notes || undefined,
                dueDate: dueDate || undefined,
            });
        }
        resetModal();
        showToast('Added');
        loadData();
    };

    const handleUpdate = async () => {
        if (!editItem || !title.trim()) return;
        const updates: Record<string, unknown> = { title: title.trim(), notes: notes || undefined, dueDate: dueDate || undefined };
        if (isTaskScope) {
            await taskRepository.update(editItem.id, { ...updates, categoryId: categoryId || undefined } as Partial<Task>);
        } else {
            await objectiveRepository.update(editItem.id, updates as Partial<Objective>);
        }
        resetModal();
        showToast('Updated');
        loadData();
    };

    const toggleItem = async (item: Task | Objective) => {
        const newStatus = item.status === 'done' ? 'open' : 'done';
        if (isTaskScope) {
            await taskRepository.update(item.id, { status: newStatus });
        } else {
            await objectiveRepository.update(item.id, { status: newStatus });
        }
        loadData();
    };

    const deleteItem = async (id: string) => {
        if (isTaskScope) {
            await taskRepository.delete(id);
        } else {
            await objectiveRepository.delete(id);
        }
        showToast('Deleted');
        loadData();
    };

    const openEdit = (item: Task | Objective) => {
        setEditItem(item);
        setTitle(item.title);
        setNotes(item.notes || '');
        setDueDate((item as any).dueDate || '');
        setCategoryId((item as Task).categoryId || '');
    };

    const resetModal = () => {
        setShowAdd(false);
        setEditItem(null);
        setTitle('');
        setNotes('');
        setDueDate('');
        setCategoryId('');
    };

    const getCategoryName = (catId?: string) => {
        if (!catId) return undefined;
        const cat = categories.find(c => c.id === catId);
        return cat ? `${cat.icon} ${cat.name}` : undefined;
    };

    // ── Derived ──
    const openItems = items.filter(i => i.status === 'open');
    const doneItems = items.filter(i => i.status === 'done');
    const viewLabel = view === 'today' ? 'Today' : view === 'week' ? 'This Week' : view === 'month' ? 'Monthly Outcomes' : 'Quarterly Outcomes';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-mono text-lg font-bold text-cr-text uppercase tracking-wider">Mission</h1>
            </div>

            {/* Scope Tabs */}
            <Tabs tabs={VIEW_TABS} activeTab={view} onChange={(id) => setView(id as MissionView)} />

            {/* Inline Quick Capture */}
            <Panel className="!p-3">
                <div className="flex items-center gap-2">
                    <input
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        placeholder={`Quick add to ${view}…`}
                        className="flex-1 bg-transparent text-sm text-cr-text placeholder:text-cr-text-muted/50 outline-none font-mono"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && quickTitle.trim()) {
                                handleQuickCapture();
                            }
                        }}
                    />
                    <Tag label={view} active size="sm" />
                </div>
            </Panel>

            {/* Main Panel */}
            <Panel
                title={viewLabel}
                glow
                headerAction={
                    <div className="flex items-center gap-3">
                        <ProgressRing done={doneItems.length} total={items.length} />
                        <span className="font-mono text-[10px] text-cr-text-muted">{RECOMMENDED[view]} recommended</span>
                        <Button size="sm" variant="primary" onClick={() => { setShowAdd(true); setTitle(''); setNotes(''); setDueDate(''); setCategoryId(''); }}>
                            + Add
                        </Button>
                    </div>
                }
            >
                {items.length === 0 ? (
                    <EmptyState
                        icon="◈"
                        title={`No ${view} items yet`}
                        description={`Use quick capture above or click +Add`}
                    />
                ) : (
                    <div className="space-y-0.5">
                        {/* Open Items */}
                        {openItems.map((item) => (
                            <ListItem
                                key={item.id}
                                title={item.title}
                                subtitle={
                                    [
                                        (item as Task).categoryId ? getCategoryName((item as Task).categoryId) : null,
                                        (item as any).dueDate ? formatDueDate((item as any).dueDate, view) : null,
                                    ].filter(Boolean).join(' · ') || undefined
                                }
                                checked={false}
                                onToggle={() => toggleItem(item)}
                                onDelete={() => deleteItem(item.id)}
                                onClick={() => openEdit(item)}
                                trailing={
                                    (item as any).dueDate ? (
                                        <Tag label={formatDueDate((item as any).dueDate, view) || 'today'} size="sm" />
                                    ) : undefined
                                }
                            />
                        ))}

                        {/* Done Items */}
                        {doneItems.length > 0 && (
                            <div className="pt-4 mt-4 border-t border-cr-border/50">
                                <h4 className="font-mono text-[10px] text-cr-text-secondary mb-2 px-2 uppercase tracking-widest">Completed</h4>
                                {doneItems.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        title={item.title}
                                        checked={true}
                                        onToggle={() => toggleItem(item)}
                                        onDelete={() => deleteItem(item.id)}
                                        className="opacity-60 hover:opacity-100 transition-opacity"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Panel>

            {/* Add Modal */}
            <Modal isOpen={showAdd} onClose={resetModal} title={`Add ${viewLabel}`}>
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAdd()}
                    />
                    <Textarea
                        label="Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Additional context…"
                    />
                    <div>
                        <label className="block font-mono text-[10px] text-cr-text-secondary uppercase tracking-wider mb-1.5">Due Date (optional)</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-md border border-cr-border bg-cr-panel px-3 py-2 text-sm text-cr-text font-mono outline-none focus:border-cr-accent transition-colors"
                        />
                    </div>
                    {isTaskScope && (
                        <Select
                            label="Category (optional)"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            options={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))]}
                        />
                    )}
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={resetModal}>Cancel</Button>
                        <Button variant="primary" onClick={handleAdd}>Add</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editItem} onClose={resetModal} title="Edit">
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                    <Textarea
                        label="Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div>
                        <label className="block font-mono text-[10px] text-cr-text-secondary uppercase tracking-wider mb-1.5">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full rounded-md border border-cr-border bg-cr-panel px-3 py-2 text-sm text-cr-text font-mono outline-none focus:border-cr-accent transition-colors"
                        />
                    </div>
                    {isTaskScope && (
                        <Select
                            label="Category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            options={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))]}
                        />
                    )}
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={resetModal}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdate}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
