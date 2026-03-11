import Dexie, { type EntityTable } from 'dexie';
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
} from '@/lib/models';

export class ControlRoomDB extends Dexie {
    tasks!: EntityTable<Task, 'id'>;
    objectives!: EntityTable<Objective, 'id'>;
    anxietyLogs!: EntityTable<AnxietyLog, 'id'>;
    calmMessages!: EntityTable<CalmMessage, 'id'>;
    parkingLotItems!: EntityTable<ParkingLotItem, 'id'>;
    categories!: EntityTable<Category, 'id'>;
    settings!: EntityTable<UserSettings, 'id'>;
    calendarEvents!: EntityTable<CalendarEvent, 'id'>;
    weeklyTargets!: EntityTable<WeeklyTarget, 'id'>;

    constructor() {
        super('ControlRoomDB');
        this.version(1).stores({
            tasks: 'id, scope, status, categoryId, dueDate, updatedAt',
            objectives: 'id, scope, status, updatedAt',
            anxietyLogs: 'id, date, updatedAt',
            calmMessages: 'id, pinned, updatedAt',
            parkingLotItems: 'id, archived, *tags, updatedAt',
            categories: 'id, name',
            settings: 'id',
        });
        this.version(2).stores({
            calendarEvents: 'id, date, eventType, updatedAt',
        });
        this.version(3).stores({
            weeklyTargets: 'id, eventType, updatedAt',
        });
    }
}

export const db = new ControlRoomDB();
