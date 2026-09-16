import type { DateKey } from './dates'
import { GOAL_FIELDS, type GoalKey } from './macros'
import type { NullableMacros, Target } from './types'

export const GOAL_KEYS = GOAL_FIELDS.map((f) => f.key)

export type GoalDraft = Record<GoalKey, string>
export type GoalValues = NullableMacros & { water: number | null }

export function emptyGoalDraft(): GoalDraft {
    return Object.fromEntries(GOAL_KEYS.map((k) => [k, ''])) as GoalDraft
}

export function targetToDraft(target: Target | null): GoalDraft {
    const draft = emptyGoalDraft()
    if (!target) return draft
    for (const key of GOAL_KEYS) {
        const value = target[key]
        draft[key] = value == null ? '' : String(value)
    }
    return draft
}

/** Latest plan whose start date is on or before `date`. ISO keys sort lexicographically. */
export function pickTargetForDate(targets: readonly Target[], date: DateKey): Target | undefined {
    return targets
        .filter((t) => t.effectiveFrom <= date)
        .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))
        .at(-1)
}

export function parseGoalField(raw: string): { ok: true; value: number | null } | { ok: false } {
    const trimmed = raw.trim()
    if (trimmed === '') return { ok: true, value: null }
    const n = Number(trimmed)
    if (!Number.isFinite(n) || n < 0) return { ok: false }
    return { ok: true, value: n }
}

export function draftToGoals(draft: GoalDraft): GoalValues | null {
    const values = {} as GoalValues
    for (const key of GOAL_KEYS) {
        const parsed = parseGoalField(draft[key])
        if (!parsed.ok) return null
        values[key] = parsed.value
    }
    return values
}

export function isGoalDraftDirty(draft: GoalDraft, baseline: GoalDraft): boolean {
    return GOAL_KEYS.some((key) => draft[key] !== baseline[key])
}
