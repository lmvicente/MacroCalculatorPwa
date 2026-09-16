import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { UtilityPage } from './UtilityPage'
import { getTargetForDate, saveTarget } from '../lib/db'
import { todayKey, monthDay } from '../lib/dates'
import { GOAL_FIELDS, type GoalKey } from '../lib/macros'
import {
    draftToGoals,
    emptyGoalDraft,
    isGoalDraftDirty,
    parseGoalField,
    targetToDraft,
    type GoalDraft,
} from '../lib/targets'

const inputClass =
    'rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong'

const labelClass =
    'mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted'

export function GoalsPage() {
    const today = todayKey()
    const current = useLiveQuery(() => getTargetForDate(today), [today])

    const [draft, setDraft] = useState<GoalDraft | null>(null)
    const [saving, setSaving] = useState(false)
    const [justSaved, setJustSaved] = useState(false)

    const baseline = targetToDraft(current ?? null)
    const showing = draft ?? (current === undefined ? emptyGoalDraft() : baseline)
    const dirty = draft != null && isGoalDraftDirty(draft, baseline)
    const valid = draftToGoals(showing) != null
    const loading = current === undefined && draft == null

    useEffect(() => {
        if (!justSaved) return
        const id = window.setTimeout(() => setJustSaved(false), 2000)
        return () => window.clearTimeout(id)
    }, [justSaved])

    function updateField(key: GoalKey, value: string) {
        setJustSaved(false)
        setDraft((prev) => ({ ...(prev ?? baseline), [key]: value }))
    }

    async function handleSave() {
        const values = draftToGoals(showing)
        if (!values) return
        setSaving(true)
        try {
            await saveTarget(values, today)
            setDraft(null)
            setJustSaved(true)
        } finally {
            setSaving(false)
        }
    }

    const calorieField = GOAL_FIELDS[0]
    const waterField = GOAL_FIELDS[1]
    const macroFields = GOAL_FIELDS.slice(2)
    const since = current?.effectiveFrom

    return (
        <UtilityPage title="Goals" eyebrow="Your targets" icon={<Target />}>
            <p className={labelClass}>Daily targets</p>
            <p className="mb-5 text-sm text-foreground-muted">
                How much you want to hit each day. Leave a field blank if you are not tracking it.
            </p>

            <div className="space-y-4">
                <GoalInput
                    field={calorieField}
                    value={showing[calorieField.key]}
                    disabled={loading || saving}
                    onChange={updateField}
                />

                <GoalInput
                    field={waterField}
                    value={showing[waterField.key]}
                    disabled={loading || saving}
                    onChange={updateField}
                />

                <div className="grid grid-cols-2 gap-2">
                    {macroFields.map((field) => (
                        <GoalInput
                            key={field.key}
                            field={field}
                            value={showing[field.key]}
                            disabled={loading || saving}
                            onChange={updateField}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={loading || saving || !dirty || !valid}
                className="mt-5 w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
            >
                {saving ? 'Saving…' : justSaved ? 'Saved' : 'Save goals'}
            </button>

            {dirty && (
                <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="mt-2 w-full py-2 text-sm text-foreground-muted active:text-foreground"
                >
                    Discard changes
                </button>
            )}

            <p className="mt-4 text-xs text-foreground-muted">
                {since
                    ? `Current plan started ${monthDay(since)}. Saving applies from today onward.`
                    : 'Saving starts a plan from today. The day view uses these numbers as soon as they are stored.'}
            </p>
        </UtilityPage>
    )
}

function GoalInput({
    field,
    value,
    disabled,
    onChange,
}: {
    field: (typeof GOAL_FIELDS)[number]
    value: string
    disabled: boolean
    onChange: (key: GoalKey, value: string) => void
}) {
    const invalid = !parseGoalField(value).ok
    const id = `goal-${field.key}`

    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-[11px] text-foreground-muted">
                <span className={field.inkClass}>{field.label}</span>
                <span>
                    {' '}
                    · {field.hint}
                    {field.unit !== 'kcal' ? ` (${field.unit})` : ''}
                </span>
            </label>
            <input
                id={id}
                className={`${inputClass} w-full ${invalid ? 'border-destructive' : ''}`}
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                inputMode="decimal"
                placeholder={field.placeholder}
                disabled={disabled}
                aria-invalid={invalid}
            />
        </div>
    )
}
