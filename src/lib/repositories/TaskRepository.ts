import { db } from '@/lib/db/database';
import type { Task, TaskScope, TaskStatus } from '@/lib/models';
import type { ITaskRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieTaskRepository implements ITaskRepository {
    async getAll(): Promise<Task[]> {
        return db.tasks.orderBy('updatedAt').reverse().toArray();
    }

    async getByScope(scope: TaskScope): Promise<Task[]> {
        return db.tasks.where('scope').equals(scope).reverse().sortBy('updatedAt');
    }

    async getByScopeAndStatus(scope: TaskScope, status: TaskStatus): Promise<Task[]> {
        return db.tasks
            .where('[scope+status]')
            .equals([scope, status])
            .reverse()
            .sortBy('updatedAt')
            .catch(() =>
                // Fallback if compound index isn't available
                db.tasks
                    .where('scope')
                    .equals(scope)
                    .filter((t) => t.status === status)
                    .reverse()
                    .sortBy('updatedAt')
            );
    }

    async getByStatus(status: TaskStatus): Promise<Task[]> {
        return db.tasks.where('status').equals(status).reverse().sortBy('updatedAt');
    }

    async getByDateRange(startDate: string, endDate: string): Promise<Task[]> {
        return db.tasks
            .where('dueDate')
            .between(startDate, endDate, true, true)
            .sortBy('dueDate');
    }

    async getById(id: string): Promise<Task | undefined> {
        return db.tasks.get(id);
    }

    async create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
        const task: Task = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.tasks.add(task);
        return task;
    }

    async update(id: string, data: Partial<Task>): Promise<void> {
        await db.tasks.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.tasks.delete(id);
    }
}

export const taskRepository = new DexieTaskRepository();
