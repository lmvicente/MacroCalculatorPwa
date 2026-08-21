import Dexie, { type Table } from 'dexie'
import type { Food, Entry, Target } from './types'

export class MacroDB extends Dexie {
    foods!: Table<Food, number>;
    entries!: Table<Entry, number>;
    targets!: Table<Target, number>;

    constructor() {
        super('MacroDB')
        this.version(1).stores({
            foods: '++id, name, lastUsedAt',
            entries: '++id, foodId, loggedAt, date, [date+meal]',
            targets: '++id, effectiveFrom'
        })
    }
}


export const db = new MacroDB();

// export async function createFood(input: ...): Promise<number> {

// }