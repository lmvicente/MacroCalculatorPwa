import Dexie, { type Table } from 'dexie'
import type { DateKey } from './dates'
import type { Food, Entry, Target, WaterLog } from './types'
import type { GoalValues } from './targets'

export class MacroDB extends Dexie {
    foods!: Table<Food, number>
    entries!: Table<Entry, number>
    targets!: Table<Target, number>
    waterLogs!: Table<WaterLog, number>

    constructor() {
        super('MacroDB')
        this.version(1).stores({
            foods: '++id, name, lastUsedAt',
            entries: '++id, foodId, loggedAt, date, [date+meal]',
            targets: '++id, effectiveFrom',
        })
        this.version(2).stores({
            foods: '++id, name, lastUsedAt',
            entries: '++id, foodId, loggedAt, date, [date+meal]',
            targets: '++id, effectiveFrom',
            waterLogs: '++id, date, loggedAt',
        })
    }
}

export const db = new MacroDB()

export async function getTargetForDate(date: DateKey): Promise<Target | null> {
    const matches = await db.targets
        .where('effectiveFrom')
        .belowOrEqual(date)
        .sortBy('effectiveFrom')
    return matches.at(-1) ?? null
}

/** Upsert the plan that starts on `effectiveFrom`. Same-day saves overwrite. */
export async function saveTarget(values: GoalValues, effectiveFrom: DateKey): Promise<number> {
    const existing = await db.targets.where('effectiveFrom').equals(effectiveFrom).first()
    const row: Target = {
        ...values,
        effectiveFrom,
        ...(existing?.id != null ? { id: existing.id } : {}),
    }
    return db.targets.put(row)
}

export async function addWaterLog(date: DateKey, ounces: number): Promise<number> {
    return db.waterLogs.add({
        date,
        ounces,
        loggedAt: Date.now(),
    })
}
