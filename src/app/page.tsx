'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ListItem } from '@/components/ui/ListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { SliderInput } from '@/components/ui/SliderInput';
import { Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Tag } from '@/components/ui/Tag';
import { taskRepository } from '@/lib/repositories/TaskRepository';
import { objectiveRepository } from '@/lib/repositories/ObjectiveRepository';
import { notNowRepository } from '@/lib/repositories/NotNowRepository';
import { anxietyRepository } from '@/lib/repositories/AnxietyRepository';
import { settingsRepository } from '@/lib/repositories/SettingsRepository';
import type { Task, Objective, NotNowItem, AnxietyLog, TaskScope } from '@/lib/models';
import { formatDate, getWeekNumber, todayString, cn } from '@/lib/utils';

export default function HomePage() {
  const { showToast } = useToast();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [monthObjectives, setMonthObjectives] = useState<Objective[]>([]);
  const [quarterObjectives, setQuarterObjectives] = useState<Objective[]>([]);
  const [notNowItems, setNotNowItems] = useState<NotNowItem[]>([]);
  const [todayAnxiety, setTodayAnxiety] = useState<AnxietyLog | null>(null);
  const [currentFocus, setCurrentFocus] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddScope, setQuickAddScope] = useState<TaskScope>('today');
  const [anxietyScore, setAnxietyScore] = useState(5);
  const [activeFlightPath, setActiveFlightPath] = useState<TaskScope | 'quarter'>('today');

  const loadData = useCallback(async () => {
    const [today, week, monthObj, quarterObj, notNow, settings] = await Promise.all([
      taskRepository.getByScope('today'),
      taskRepository.getByScope('week'),
      objectiveRepository.getByScope('month'),
      objectiveRepository.getByScope('quarter'),
      notNowRepository.getActive(),
      settingsRepository.get(),
    ]);
    setTodayTasks(today.filter(t => t.status !== 'archived'));
    setWeekTasks(week.filter(t => t.status !== 'archived'));
    setMonthObjectives(monthObj.filter(o => o.status !== 'archived'));
    setQuarterObjectives(quarterObj.filter(o => o.status !== 'archived'));
    setNotNowItems(notNow.slice(0, 5));
    setCurrentFocus(settings.currentFocus || '');

    const anxLog = await anxietyRepository.getByDate(todayString());
    if (anxLog) {
      setTodayAnxiety(anxLog);
      setAnxietyScore(anxLog.score || 5);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for keyboard shortcut
  useEffect(() => {
    const handler = () => setShowQuickAdd(true);
    window.addEventListener('cr:new-task', handler);
    return () => window.removeEventListener('cr:new-task', handler);
  }, []);

  const handleQuickAdd = async () => {
    if (!newTaskTitle.trim()) return;
    await taskRepository.create({
      title: newTaskTitle.trim(),
      scope: quickAddScope,
      status: 'open',
    });
    setNewTaskTitle('');
    setShowQuickAdd(false);
    showToast('Task added');
    loadData();
  };

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'open' : 'done';
    await taskRepository.update(task.id, { status: newStatus });
    loadData();
  };

  const toggleObjective = async (objective: Objective) => {
    const newStatus = objective.status === 'done' ? 'open' : 'done';
    await objectiveRepository.update(objective.id, { status: newStatus });
    loadData();
  };

  const deleteTask = async (id: string) => {
    await taskRepository.delete(id);
    loadData();
  };

  const deleteObjective = async (id: string) => {
    await objectiveRepository.delete(id);
    loadData();
  };

  const saveAnxietyScore = async () => {
    if (todayAnxiety) {
      await anxietyRepository.update(todayAnxiety.id, { score: anxietyScore });
    } else {
      await anxietyRepository.create({ date: todayString(), score: anxietyScore });
    }
    showToast('Anxiety score saved');
    loadData();
  };

  const saveFocus = async () => {
    await settingsRepository.update({ currentFocus });
    showToast('Focus updated');
  };

  const now = new Date();
  const openToday = todayTasks.filter(t => t.status === 'open').length;
  const doneToday = todayTasks.filter(t => t.status === 'done').length;

  const cycleFlightPath = () => {
    const scopes: ('today' | 'week' | 'month' | 'quarter')[] = ['today', 'week', 'month', 'quarter'];
    const currentIndex = scopes.indexOf(activeFlightPath as any);
    setActiveFlightPath(scopes[(currentIndex + 1) % scopes.length] as TaskScope | 'quarter');
  };

  const currentList = {
    today: todayTasks,
    week: weekTasks,
    month: monthObjectives,
    quarter: quarterObjectives,
    someday: [],
  }[activeFlightPath as string] as (Task | Objective)[];

  const toggleCurrentItem = activeFlightPath === 'today' || activeFlightPath === 'week' ? toggleTask : toggleObjective;
  const deleteCurrentItem = activeFlightPath === 'today' || activeFlightPath === 'week' ? deleteTask : deleteObjective;

  return (
    <div className="space-y-4">
      {/* ── Status Strip ─────────────────────────────────── */}
      <Panel className="!p-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="font-mono text-xs text-cr-text">
            <span className="text-cr-accent">◉</span> {formatDate(now)}
          </div>
          <div className="font-mono text-xs text-cr-text-secondary">
            W{getWeekNumber(now)}
          </div>
          {currentFocus && (
            <div className="font-mono text-xs">
              <span className="text-cr-text-secondary">FOCUS:</span>{' '}
              <span className="text-cr-accent">{currentFocus}</span>
            </div>
          )}
          {todayAnxiety?.score && (
            <Tag label={`Anxiety: ${todayAnxiety.score}/10`} color={todayAnxiety.score > 6 ? '#cf3e3e' : '#cfa63e'} />
          )}
          <div className="font-mono text-xs text-cr-text-secondary ml-auto">
            {openToday} open · {doneToday} done
          </div>
        </div>
      </Panel>

      {/* ── Focus editor (inline) ──────────────────────── */}
      <Panel className="!p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-cr-text-secondary shrink-0">FOCUS ▸</span>
          <input
            value={currentFocus}
            onChange={(e) => setCurrentFocus(e.target.value)}
            onBlur={saveFocus}
            onKeyDown={(e) => e.key === 'Enter' && saveFocus()}
            placeholder="What's your current objective?"
            className="flex-1 bg-transparent text-sm text-cr-text placeholder:text-cr-text-muted outline-none font-mono"
          />
        </div>
      </Panel>

      {/* ── Main Grid (Cockpit Layout) ────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Sidebar: Telemetry & Context */}
        <div className="md:col-span-3 lg:col-span-3 space-y-4">
           {/* Anxiety Mini Panel (System Status) */}
           <Panel title="System Status" className="border-cr-border bg-transparent">
             <div className="space-y-4">
              <a
                href="/calm"
                className="block w-full rounded-md bg-cr-panel border border-cr-border py-2 text-center font-mono text-xs font-bold text-cr-text-secondary hover:bg-cr-panel-hover hover:text-cr-text transition-all duration-200"
              >
                FOCUS RESET (ESC)
              </a>
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] font-mono text-cr-text-secondary mb-1">
                   <span>STRESS LEVEL</span>
                   <span>{anxietyScore}/10</span>
                 </div>
                 <SliderInput
                   value={anxietyScore}
                   onChange={setAnxietyScore}
                   min={1}
                   max={10}
                 />
                 <Button size="sm" variant="ghost" onClick={saveAnxietyScore} className="w-full text-[10px] h-6 mt-1 opacity-80 hover:opacity-100">
                   Update System
                 </Button>
               </div>
             </div>
           </Panel>

           {/* Peripheral Context: Week/Month/Quarter Telemetry */}
           <Panel title="Mission Context" className="border-cr-border bg-transparent">
             <div className="space-y-4">
               {/* Week Progress */}
               <div>
                  <div className="flex justify-between text-[10px] font-mono text-cr-text-muted mb-1.5 break-all">
                    <span>WEEKLY FOCUS</span>
                    <span>{weekTasks.filter(t => t.status==='done').length}/{weekTasks.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="h-1 flex-1 bg-cr-bg overflow-hidden rounded-full border border-cr-border">
                        <div className="h-full bg-cr-accent transition-all" style={{ width: `${weekTasks.length === 0 ? 0 : (weekTasks.filter(t => t.status==='done').length / weekTasks.length) * 100}%`}} />
                     </div>
                  </div>
               </div>

                {/* Month Progress */}
               <div>
                  <div className="flex justify-between text-[10px] font-mono text-cr-text-secondary mb-1.5">
                    <span>MONTHLY OUTCOMES</span>
                    <span>{monthObjectives.filter(t => t.status==='done').length}/{monthObjectives.length}</span>
                  </div>
                  <div className="flex gap-1">
                     {monthObjectives.length > 0 ? Array.from({ length: Math.max(monthObjectives.length, 3) }).map((_, i) => (
                        <div key={i} className={cn("h-1.5 flex-1 rounded-sm", 
                           i >= monthObjectives.length ? "bg-cr-bg border border-cr-border" : 
                           monthObjectives[i].status === 'done' ? "bg-cr-accent" : "bg-cr-border"
                        )} />
                     )) : (
                        <span className="text-[10px] font-mono text-cr-text-secondary italic">No outcomes set</span>
                     )}
                  </div>
               </div>

                {/* Quarter Progress */}
               <div>
                  <div className="flex justify-between text-[10px] font-mono text-cr-text-secondary mb-1.5">
                    <span>QUARTERLY OUTCOMES</span>
                    <span>{quarterObjectives.filter(t => t.status==='done').length}/{quarterObjectives.length}</span>
                  </div>
                   <div className="flex gap-1">
                     {quarterObjectives.length > 0 ? Array.from({ length: Math.max(quarterObjectives.length, 2) }).map((_, i) => (
                        <div key={i} className={cn("h-1.5 flex-1 rounded-sm", 
                           i >= quarterObjectives.length ? "bg-cr-bg border border-cr-border" : 
                           quarterObjectives[i].status === 'done' ? "bg-cr-accent" : "bg-cr-border"
                        )} />
                     )) : (
                        <span className="text-[10px] font-mono text-cr-text-secondary italic">No outcomes set</span>
                     )}
                  </div>
               </div>
             </div>
           </Panel>
           
           {/* Not Now Preview */}
          <Panel
            title="Parking Lot"
            className="border-cr-border bg-transparent"
            headerAction={
              <a href="/not-now" className="font-mono text-[10px] text-cr-accent/80 hover:text-cr-accent transition-colors">
                View All →
              </a>
            }
          >
            {notNowItems.length === 0 ? (
              <div className="text-[10px] font-mono text-cr-text-muted italic py-2">Empty</div>
            ) : (
              <div className="space-y-1">
                {notNowItems.slice(0, 3).map((item) => (
                   <div key={item.id} className="text-[10px] font-mono truncate text-cr-text-secondary">
                     • {item.title}
                   </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Center Console: Immediate Actions */}
        <div className="md:col-span-9 lg:col-span-9">
        <Panel
          title={
            <div className="flex items-center gap-2 -ml-1">
              <span>ACTIVE FLIGHT PATH:</span>
              <button 
                onClick={cycleFlightPath}
                className="text-[10px] text-cr-accent bg-cr-accent/10 hover:bg-cr-accent/20 px-2 py-0.5 rounded border border-cr-accent/30 transition-colors cursor-pointer tracking-[0.2em]"
              >
                {activeFlightPath}
              </button>
            </div>
          }
          glow
          className="h-full border-cr-border bg-cr-panel/80"
          headerAction={
            <Button size="sm" variant="primary" onClick={() => { setQuickAddScope(activeFlightPath === 'quarter' ? 'today' : activeFlightPath); setShowQuickAdd(true); }} className="h-7 text-xs px-3">
              + Execute [N]
            </Button>
          }
        >
          {currentList.length === 0 ? (
            <EmptyState icon="▹" title={`No actions for ${activeFlightPath}`} description={`Press 'n' or click +Add to add a task to ${activeFlightPath}`} />
          ) : (
            <div className="space-y-1 mt-4">
              {(currentList as any[]).filter(t => t.status === 'open').map((item) => (
                <ListItem
                  key={item.id}
                  title={item.title}
                  checked={item.status === 'done'}
                  onToggle={() => toggleCurrentItem(item as any)}
                  onDelete={() => deleteCurrentItem(item.id)}
                  className="py-3 px-4 bg-cr-panel border border-cr-border hover:border-cr-accent/50 transition-colors"
                />
              ))}
               {(currentList as any[]).filter(t => t.status === 'done').length > 0 && (
                <div className="pt-4 mt-4 border-t border-cr-border/50">
                  <h4 className="font-mono text-[10px] text-cr-text-secondary mb-2 px-2 uppercase tracking-widest">Completed</h4>
                  {(currentList as any[]).filter(t => t.status === 'done').map((item) => (
                    <ListItem
                      key={item.id}
                      title={item.title}
                      checked={item.status === 'done'}
                      onToggle={() => toggleCurrentItem(item as any)}
                      onDelete={() => deleteCurrentItem(item.id)}
                      className="py-1.5 px-2 opacity-80 hover:opacity-100 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>
        </div>
      </div>

      {/* ── Quick Add Modal ──────────────────────────────── */}
      <Modal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="Quick Add Task">
        <div className="space-y-4">
          <Input
            label="Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
          />
          <Select
            label="Scope"
            value={quickAddScope}
            onChange={(e) => setQuickAddScope(e.target.value as TaskScope)}
            options={[
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'quarter', label: 'This Quarter' },
              { value: 'someday', label: 'Someday' },
            ]}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowQuickAdd(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleQuickAdd}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
