import { expect, test } from 'vitest'
import type { Target } from './types'
import {
    draftToGoals,
    emptyGoalDraft,
    isGoalDraftDirty,
    parseGoalField,
    pickTargetForDate,
    targetToDraft,
} from './targets'

const monday: Target = {
    id: 1,
    effectiveFrom: '2026-09-14',
    kcal: 2200,
    protein: 150,
    carbs: 200,
    fat: 70,
    fiber: 30,
}

const wednesday: Target = {
    id: 2,
    effectiveFrom: '2026-09-16',
    kcal: 1800,
    protein: 140,
    carbs: null,
    fat: 60,
    fiber: 35,
}

test('picks the latest plan that has already started', () => {
    const plans = [wednesday, monday]
    expect(pickTargetForDate(plans, '2026-09-13')).toBeUndefined()
    expect(pickTargetForDate(plans, '2026-09-14')?.id).toBe(1)
    expect(pickTargetForDate(plans, '2026-09-15')?.id).toBe(1)
    expect(pickTargetForDate(plans, '2026-09-16')?.id).toBe(2)
})

test('blank goal fields become null, invalid ones fail', () => {
    expect(parseGoalField('')).toEqual({ ok: true, value: null })
    expect(parseGoalField(' 150 ')).toEqual({ ok: true, value: 150 })
    expect(parseGoalField('-1').ok).toBe(false)
    expect(parseGoalField('abc').ok).toBe(false)
})

test('draft conversion round-trips nulls as blank inputs', () => {
    const draft = targetToDraft(wednesday)
    expect(draft.kcal).toBe('1800')
    expect(draft.carbs).toBe('')
    expect(draft.water).toBe('')
    expect(draftToGoals(draft)).toEqual({
        kcal: 1800,
        protein: 140,
        carbs: null,
        fat: 60,
        fiber: 35,
        water: null,
    })
})

test('dirty check compares against the saved baseline', () => {
    const baseline = emptyGoalDraft()
    expect(isGoalDraftDirty(baseline, baseline)).toBe(false)
    expect(isGoalDraftDirty({ ...baseline, protein: '150' }, baseline)).toBe(true)
})
