// ── Cockpit Data Models ──────────────────────────────

export type TaskScope = 'today' | 'week' | 'month' | 'quarter' | 'someday';
export type TaskStatus = 'open' | 'done' | 'archived';
export type ObjectiveScope = 'quarter' | 'month' | 'week';

export interface UserSettings {
  id: string;
  reduceMotion: boolean;
  scanlineLevel: number; // 0=off, 1=subtle, 2=medium, 3=max
  currentFocus: string;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  colorHint: string;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  categoryId?: string;
  dueDate?: string;
  scope: TaskScope;
  status: TaskStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Objective {
  id: string;
  scope: ObjectiveScope;
  title: string;
  notes?: string;
  dueDate?: string;        // 'YYYY-MM-DD'
  startDate?: string;
  endDate?: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
}

export interface AnxietyLog {
  id: string;
  date: string;
  score?: number;
  thought?: string;
  body?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CalmMessage {
  id: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ParkingLotItem {
  id: string;
  title: string;
  notes?: string;
  tags: string[];
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export type EventType = 'fitness' | 'work' | 'social' | 'personal' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: EventType;
  customType?: string;
  date: string;          // 'YYYY-MM-DD'
  startTime: string;     // 'HH:mm'
  endTime: string;       // 'HH:mm'
  location?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WeeklyTarget {
  id: string;
  eventType: EventType;
  targetCount: number;   // sessions per week
  createdAt: number;
  updatedAt: number;
}
