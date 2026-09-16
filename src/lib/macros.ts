export type MacroKey = 'protein' | 'carbs' | 'fat' | 'fiber'
export type GoalKey = 'kcal' | 'water' | MacroKey

export interface MacroMeta {
    key: MacroKey
    label: string
    fillClass: string
    inkClass: string
    direction: 'floor' | 'ceiling' //for goals, hit a minimum dont exceed a maximum
}

export const MACROS: MacroMeta[] = [
    { key: 'protein', label: 'Protein', fillClass: 'bg-protein-fill', inkClass: 'text-protein-ink', direction: 'floor' },
    { key: 'carbs',   label: 'Carbs',   fillClass: 'bg-carbs-fill',   inkClass: 'text-carbs-ink',   direction: 'ceiling' },
    { key: 'fat',     label: 'Fat',     fillClass: 'bg-fat-fill',     inkClass: 'text-fat-ink',     direction: 'ceiling' },
    { key: 'fiber',   label: 'Fiber',   fillClass: 'bg-fiber-fill',   inkClass: 'text-fiber-ink',   direction: 'floor' },
]

export interface GoalField {
    key: GoalKey
    label: string
    unit: string
    placeholder: string
    hint: string
    inkClass: string
}

const DIRECTION_HINT: Record<MacroMeta['direction'], string> = {
    floor: 'at least',
    ceiling: 'at most',
}

const PLACEHOLDERS: Record<GoalKey, string> = {
    kcal: '2200',
    water: '64',
    protein: '150',
    carbs: '200',
    fat: '70',
    fiber: '30',
}

export const GOAL_FIELDS: GoalField[] = [
    {
        key: 'kcal',
        label: 'Calories',
        unit: 'kcal',
        placeholder: PLACEHOLDERS.kcal,
        hint: 'daily target',
        inkClass: 'text-primary-ink',
    },
    {
        key: 'water',
        label: 'Water',
        unit: 'fl oz',
        placeholder: PLACEHOLDERS.water,
        hint: 'daily target',
        inkClass: 'text-water-ink',
    },
    ...MACROS.map((m) => ({
        key: m.key,
        label: m.label,
        unit: 'g',
        placeholder: PLACEHOLDERS[m.key],
        hint: DIRECTION_HINT[m.direction],
        inkClass: m.inkClass,
    })),
]