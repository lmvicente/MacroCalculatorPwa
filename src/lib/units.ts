import type { Unit, UnitFamily } from "./types";

export const UNITS_BY_FAMILY: Record<UnitFamily, Unit[]> = {
  mass:   ['g', 'oz'],
  volume: ['ml', 'floz', 'cup'],
  count:  ['each'],
}

export const MULTIPLIER: Record<Unit, number> = {
    g: 1,
    oz: 28.3495,
    ml: 1,
    floz: 29.5735,
    cup: 236.588,
    each: 1
}

export function toBaseUnits(amount: number, unit: Unit) : number {
    return amount * MULTIPLIER[unit]
}


//familyOf(unit) — which family does a unit belong to? Needed for the guard: before converting, check the unit's family matches the food's, and throw if not. This is what stops "30g of serving, 2 cups eaten" producing nonsense.

export const FAMILY_OF: Record<Unit, UnitFamily> = {
    g: 'mass',
    oz: 'mass',
    ml: 'volume',
    floz: 'volume',
    cup: 'volume',
    each: 'count'
}