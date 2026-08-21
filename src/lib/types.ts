import type { DateKey } from "./dates"

export interface Macros {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
}


export type UnitFamily = 'mass' | 'volume' | 'count'
export type Unit = 'g' | 'oz' | 'ml' | 'floz' | 'cup' | 'each'
export type NullableMacros = { [K in keyof Macros]: Macros[K] | null } //take the Macros interface and allow it to be null

export interface Entry extends Macros {
    id?: number;
    date: DateKey;
    loggedAt: number;
    meal?: string;
    foodId: number;
    amount: number;
    unit: Unit;
}

export interface Food extends Macros {
    id?: number;
    name: string;
    brand?: string;
    unitFamily: UnitFamily;
    countLabel?: string;
    lastUsedAt: number;
}

export interface Target extends NullableMacros {
    id?: number;
    effectiveFrom: DateKey;
}