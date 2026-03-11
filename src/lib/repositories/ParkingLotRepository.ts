import { db } from '@/lib/db/database';
import type { ParkingLotItem } from '@/lib/models';
import type { IParkingLotRepository } from './interfaces';
import { generateId, now } from '@/lib/utils';

export class DexieParkingLotRepository implements IParkingLotRepository {
    async getAll(): Promise<ParkingLotItem[]> {
        return db.parkingLotItems.orderBy('updatedAt').reverse().toArray();
    }

    async getActive(): Promise<ParkingLotItem[]> {
        return db.parkingLotItems.filter(item => !item.archived).reverse().sortBy('updatedAt');
    }

    async getArchived(): Promise<ParkingLotItem[]> {
        return db.parkingLotItems.filter(item => !!item.archived).reverse().sortBy('updatedAt');
    }

    async create(data: Omit<ParkingLotItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParkingLotItem> {
        const item: ParkingLotItem = {
            ...data,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
        };
        await db.parkingLotItems.add(item);
        return item;
    }

    async update(id: string, data: Partial<ParkingLotItem>): Promise<void> {
        await db.parkingLotItems.update(id, { ...data, updatedAt: now() });
    }

    async delete(id: string): Promise<void> {
        await db.parkingLotItems.delete(id);
    }
}

export const parkingLotRepository = new DexieParkingLotRepository();
