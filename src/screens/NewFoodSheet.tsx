import { useState } from 'react';
import { Sheet } from '../components/Sheet'
import type { Food, Macros, Unit } from '../lib/types';
import { FAMILY_OF, toBaseUnits, UNITS_BY_FAMILY } from '../lib/units';
import { db } from '../lib/db';

export function NewFoodSheet() {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [servingAmount, setServingAmount] = useState('');
    const [servingUnit, setServingUnit] = useState<Unit>('g'); //no unit family because we use the unit to derive the family
    const [countLabel, setCountLabel] = useState(''); //rendered only if it ssomething other than the predefined units

    //macros
    const [kcal, setKcal] = useState('');
    const [protein, setProtein] = useState('');
    const [carbs, setCarbs] = useState('');
    const [fat, setFat] = useState('');
    const [fiber, setFiber] = useState('');

    const handleSave = async  () => {
        const foodAmount = Number(servingAmount); //this is because the interface food extends macros
        const kcalTotal = Number(kcal);
        const proteinTotal = Number(protein);
        const carbTotal = Number(carbs);
        const fatTotal = Number(fat);
        const fiberTotal = Number(fiber);

        if (!name.trim() || !(foodAmount > 0)) return

        const servingInBase = toBaseUnits(foodAmount, servingUnit)

        const perUnit : Macros = { //typescript declaration to the Macros interface
            kcal: kcalTotal / servingInBase,
            protein: proteinTotal / servingInBase,
            carbs: carbTotal / servingInBase,
            fat: fatTotal / servingInBase,
            fiber: fiberTotal / servingInBase
        }

        const uf = FAMILY_OF[servingUnit]

        const foodObject : Food = {
            ...perUnit, //spread operator lets you grab all of them from the perUnit 
            unitFamily: uf,
            name: name, 
            brand: brand, 
            countLabel: countLabel,
            lastUsedAt: Date.now(),
        }

        const id = await db.foods.add(foodObject)
        console.log('saved', id)
         
    }

  const inputClass =
    'rounded-2xl border border-border bg-surface-2 px-4 py-3 text-foreground outline-none placeholder:text-foreground-muted focus:border-border-strong'
 
  const labelClass =
    'mb-1.5 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-foreground-muted'
 
  const macroFields = [
    { label: 'Calories', value: kcal, set: setKcal, placeholder: '165' },
    { label: 'Protein (g)', value: protein, set: setProtein, placeholder: '31' },
    { label: 'Carbs (g)', value: carbs, set: setCarbs, placeholder: '0' },
    { label: 'Fat (g)', value: fat, set: setFat, placeholder: '3.6' },
    { label: 'Fiber (g)', value: fiber, set: setFiber, placeholder: '0' },
  ]
  return (
    <Sheet eyebrow="New food item" title="Nutrition facts">
      <div className="max-h-[65vh] space-y-4 overflow-y-auto pb-2">
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={`${inputClass} w-full`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chicken thigh"
          />
        </div>
 
        <div>
          <label className={labelClass}>
            Brand <span className="normal-case tracking-normal">optional</span>
          </label>
          <input
            className={`${inputClass} w-full`}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Kirkland"
          />
        </div>
 
        <div className="h-px bg-border" />
 
        <div>
          <label className={labelClass}>Serving size on the label</label>
          <div className="flex gap-2">
            <input
              className={`${inputClass} min-w-0 flex-1`}
              value={servingAmount}
              onChange={(e) => setServingAmount(e.target.value)}
              inputMode="decimal"
              placeholder="100"
            />
            <select
              className={`${inputClass} w-24 shrink-0`}
              value={servingUnit}
              onChange={(e) => setServingUnit(e.target.value as Unit)}
            >
              {Object.values(UNITS_BY_FAMILY)
                .flat()
                .map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
            </select>
          </div>
        </div>
 
        {servingUnit === 'each' && (
          <div>
            <label className={labelClass}>What is one of them?</label>
            <input
              className={`${inputClass} w-full`}
              value={countLabel}
              onChange={(e) => setCountLabel(e.target.value)}
              placeholder="slice"
            />
          </div>
        )}
 
        <div className="h-px bg-border" />
 
        <p className={labelClass}>Per that serving</p>
        <div className="grid grid-cols-2 gap-2">
          {macroFields.map((f) => (
            <div key={f.label}>
              <label className="mb-1 block text-[11px] text-foreground-muted">{f.label}</label>
              <input
                className={`${inputClass} w-full`}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                inputMode="decimal"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
 
        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground active:scale-[0.99]"
        >
          Save food
        </button>
      </div>
    </Sheet>
  )
}