import type {
    Task,
    Objective,
    AnxietyLog,
    CalmMessage,
    ParkingLotItem,
    Category,
    UserSettings,
    CalendarEvent,
    WeeklyTarget,
    TaskScope,
    TaskStatus,
} from '@/lib/models';

// ── Repository Interfaces ─────────────────────────────────
// These interfaces allow swapping Dexie for Firebase later.

export interface ITaskRepository {
    getAll(): Promise<Task[]>;
    getByScope(scope: TaskScope): Promise<Task[]>;
    getByScopeAndStatus(scope: TaskScope, status: TaskStatus): Promise<Task[]>;
    getByStatus(status: TaskStatus): Promise<Task[]>;
    getByDateRange(startDate: string, endDate: string): Promise<Task[]>;
    getById(id: string): Promise<Task | undefined>;
    create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
    update(id: string, data: Partial<Task>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface IObjectiveRepository {
    getAll(): Promise<Objective[]>;
    getByScope(scope: string): Promise<Objective[]>;
    getByDateRange(startDate: string, endDate: string): Promise<Objective[]>;
    getById(id: string): Promise<Objective | undefined>;
    create(obj: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>): Promise<Objective>;
    update(id: string, data: Partial<Objective>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface IAnxietyRepository {
    getAll(): Promise<AnxietyLog[]>;
    getByDate(date: string): Promise<AnxietyLog | undefined>;
    create(log: Omit<AnxietyLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnxietyLog>;
    update(id: string, data: Partial<AnxietyLog>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface ICalmRepository {
    getAll(): Promise<CalmMessage[]>;
    getPinned(): Promise<CalmMessage[]>;
    create(msg: Omit<CalmMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalmMessage>;
    update(id: string, data: Partial<CalmMessage>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface IParkingLotRepository {
    getAll(): Promise<ParkingLotItem[]>;
    getActive(): Promise<ParkingLotItem[]>;
    getArchived(): Promise<ParkingLotItem[]>;
    create(item: Omit<ParkingLotItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParkingLotItem>;
    update(id: string, data: Partial<ParkingLotItem>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface ICategoryRepository {
    getAll(): Promise<Category[]>;
    getById(id: string): Promise<Category | undefined>;
    create(cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
    update(id: string, data: Partial<Category>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface ISettingsRepository {
    get(): Promise<UserSettings>;
    update(data: Partial<UserSettings>): Promise<void>;
}

export interface ICalendarEventRepository {
    getAll(): Promise<CalendarEvent[]>;
    getByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]>;
    getByDate(date: string): Promise<CalendarEvent[]>;
    getById(id: string): Promise<CalendarEvent | undefined>;
    create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent>;
    update(id: string, data: Partial<CalendarEvent>): Promise<void>;
    delete(id: string): Promise<void>;
}

export interface IWeeklyTargetRepository {
    getAll(): Promise<WeeklyTarget[]>;
    getById(id: string): Promise<WeeklyTarget | undefined>;
    create(target: Omit<WeeklyTarget, 'id' | 'createdAt' | 'updatedAt'>): Promise<WeeklyTarget>;
    update(id: string, data: Partial<WeeklyTarget>): Promise<void>;
    delete(id: string): Promise<void>;
}
