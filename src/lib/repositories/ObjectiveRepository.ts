import { db } from '@/lib/db/database';
import type { Objective } from '@/lib/models';
import type { IObjectiveRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieObjectiveRepository implements IObjectiveRepository {
    async getAll(): Promise<Objective[]> {
        return db.objectives.orderBy('updatedAt').reverse().toArray();
    }

    async getByScope(scope: string): Promise<Objective[]> {
        return db.objectives.where('scope').equals(scope).reverse().sortBy('updatedAt');
    }

    async getByDateRange(startDate: string, endDate: string): Promise<Objective[]> {
        return db.objectives
            .where('dueDate')
            .between(startDate, endDate, true, true)
            .sortBy('dueDate');
    }

    async getById(id: string): Promise<Objective | undefined> {
        return db.objectives.get(id);
    }

    async create(data: Omit<Objective, 'id' | 'createdAt' | 'updatedAt'>): Promise<Objective> {
        const obj: Objective = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.objectives.add(obj);
        return obj;
    }

    async update(id: string, data: Partial<Objective>): Promise<void> {
        await db.objectives.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.objectives.delete(id);
    }
}

export const objectiveRepository = new DexieObjectiveRepository();
