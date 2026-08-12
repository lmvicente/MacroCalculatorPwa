export type MacroKey = 'protein' | 'carbs' | 'fat' | 'fiber'

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