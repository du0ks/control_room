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
import { parkingLotRepository } from '@/lib/repositories/ParkingLotRepository';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import type { ParkingLotItem, TaskScope } from '@/lib/models';
import { cn } from '@/lib/utils';

const VIEW_TABS = [
    { id: 'active', label: 'Active' },
    { id: 'archived', label: 'Archived' },
    { id: 'review', label: '⟳ Review' },
];

export default function ParkingLotPage() {
    const { showToast } = useToast();
    const [view, setView] = useState('active');
    const [items, setItems] = useState<ParkingLotItem[]>([]);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editItem, setEditItem] = useState<ParkingLotItem | null>(null);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [reviewIndex, setReviewIndex] = useState(0);
    const [moveScope, setMoveScope] = useState<TaskScope>('today');

    const loadItems = useCallback(async () => {
        let data: ParkingLotItem[];
        if (view === 'archived') {
            data = await parkingLotRepository.getArchived();
        } else {
            data = await parkingLotRepository.getActive();
        }
        setItems(data);
    }, [view]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // Listen for search shortcut
    useEffect(() => {
        const handler = () => {
            const input = document.getElementById('parking-lot-search');
            input?.focus();
        };
        window.addEventListener('cr:search', handler);
        return () => window.removeEventListener('cr:search', handler);
    }, []);

    const handleAdd = async () => {
        if (!title.trim()) return;
        await parkingLotRepository.create({
            title: title.trim(),
            notes: notes || undefined,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            archived: false,
        });
        resetForm();
        setShowAdd(false);
        showToast('Added to parking lot');
        loadItems();
    };

    const handleUpdate = async () => {
        if (!editItem || !title.trim()) return;
        await parkingLotRepository.update(editItem.id, {
            title: title.trim(),
            notes: notes || undefined,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        });
        setEditItem(null);
        resetForm();
        showToast('Updated');
        loadItems();
    };

    const resetForm = () => {
        setTitle('');
        setNotes('');
        setTags('');
    };

    const archiveItem = async (id: string) => {
        await parkingLotRepository.update(id, { archived: true });
        showToast('Archived');
        loadItems();
    };

    const unarchiveItem = async (id: string) => {
        await parkingLotRepository.update(id, { archived: false });
        showToast('Restored');
        loadItems();
    };

    const deleteItem = async (id: string) => {
        await parkingLotRepository.delete(id);
        showToast('Deleted');
        loadItems();
    };

    const moveToPlans = async (item: ParkingLotItem) => {
        await taskRepository.create({
            title: item.title,
            scope: moveScope,
            status: 'open',
            notes: item.notes,
        });
        await parkingLotRepository.update(item.id, { archived: true });
        showToast(`Moved to ${moveScope}`);
        loadItems();
        setReviewIndex(prev => Math.min(prev, items.length - 2));
    };

    const openEdit = (item: ParkingLotItem) => {
        setEditItem(item);
        setTitle(item.title);
        setNotes(item.notes || '');
        setTags(item.tags.join(', '));
    };

    const filteredItems = search
        ? items.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
        )
        : items;

    // Review mode
    const activeItems = items.filter(i => !i.archived);
    const reviewItem = activeItems[reviewIndex];

    const getDaysOld = (timestamp: number) => {
        return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="font-mono text-lg font-bold text-cr-text uppercase tracking-wider">Parking Lot</h1>
                <Button variant="primary" onClick={() => { setShowAdd(true); resetForm(); }}>
                    + Add
                </Button>
            </div>

            <Tabs tabs={VIEW_TABS} activeTab={view} onChange={(id) => { setView(id); setReviewIndex(0); }} />

            {view !== 'review' && (
                <>
                    {/* Search */}
                    <Input
                        id="parking-lot-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search items or tags... (press / to focus)"
                    />

                    <Panel title={view === 'active' ? 'Parking Lot' : 'Archived'} glow>
                        {filteredItems.length === 0 ? (
                            <EmptyState
                                icon="◇"
                                title={search ? 'No matching items' : view === 'active' ? 'Parking lot is empty' : 'No archived items'}
                            />
                        ) : (
                            <div className="space-y-0.5">
                                {filteredItems.map((item) => {
                                    const daysOld = getDaysOld(item.updatedAt || item.createdAt);
                                    const isStale = daysOld > 30;
                                    const isDecaying = daysOld > 60;

                                    return (
                                        <div key={item.id} className="relative group/item">
                                            {isStale && view === 'active' && (
                                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-cr-warning/50 rounded-full" title={`Untouched for ${daysOld} days`} />
                                            )}
                                            <ListItem
                                                title={item.title}
                                                subtitle={item.notes}
                                                onClick={() => openEdit(item)}
                                                onDelete={() => deleteItem(item.id)}
                                                className={cn(view === 'active' && isDecaying && "opacity-50 hover:opacity-100")}
                                                trailing={
                                                    <div className="flex items-center gap-1.5">
                                                        {item.tags.map(t => <Tag key={t} label={t} size="sm" />)}
                                                        {view === 'active' ? (
                                                            <>
                                                                {isStale && (
                                                                    <span className="text-[10px] font-mono text-cr-warning/70 mr-2 hidden sm:inline-block">
                                                                        {daysOld}d old
                                                                    </span>
                                                                )}
                                                                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); archiveItem(item.id); }}>
                                                                    Archive
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); unarchiveItem(item.id); }}>
                                                                Restore
                                                            </Button>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Panel>
                </>
            )}

            {/* Review Mode */}
            {view === 'review' && (
                <Panel title="Review Mode" glow>
                    {activeItems.length === 0 ? (
                        <EmptyState icon="◇" title="Nothing to review" />
                    ) : reviewItem ? (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="font-mono text-xs text-cr-text-muted mb-2">
                                    {reviewIndex + 1} / {activeItems.length}
                                </p>
                                <h3 className="text-lg text-cr-text font-medium">{reviewItem.title}</h3>
                                {reviewItem.notes && (
                                    <p className="text-sm text-cr-text-secondary mt-2">{reviewItem.notes}</p>
                                )}
                                {reviewItem.tags.length > 0 && (
                                    <div className="flex justify-center gap-1 mt-3">
                                        {reviewItem.tags.map(t => <Tag key={t} label={t} />)}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={moveScope}
                                        onChange={(e) => setMoveScope(e.target.value as TaskScope)}
                                        options={[
                                            { value: 'today', label: 'Today' },
                                            { value: 'week', label: 'Week' },
                                            { value: 'month', label: 'Month' },
                                            { value: 'quarter', label: 'Quarter' },
                                        ]}
                                        className="flex-1"
                                    />
                                    <Button variant="primary" onClick={() => moveToPlans(reviewItem)}>
                                        Move to Plans
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => setReviewIndex(prev => Math.max(0, prev - 1))}
                                        disabled={reviewIndex === 0}
                                    >
                                        ← Prev
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => {
                                            archiveItem(reviewItem.id);
                                        }}
                                    >
                                        Archive
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="flex-1"
                                        onClick={() => setReviewIndex(prev => Math.min(activeItems.length - 1, prev + 1))}
                                        disabled={reviewIndex >= activeItems.length - 1}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <EmptyState icon="✓" title="Review complete!" />
                    )}
                </Panel>
            )}

            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add to Parking Lot">
                <div className="space-y-4">
                    <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What to park?" autoFocus />
                    <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Details..." />
                    <Input label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="idea, project, someday" />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                        <Button variant="primary" onClick={handleAdd}>Add</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Item">
                <div className="space-y-4">
                    <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                    <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    <Input label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                        <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
                        <Button variant="primary" onClick={handleUpdate}>Save</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
