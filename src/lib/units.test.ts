import { expect, test } from 'vitest'
import { UNITS_BY_FAMILY, toBaseUnits } from './units'

test('mass family offers grams and ounces', () => {
  expect(UNITS_BY_FAMILY['mass']).toEqual(['g', 'oz'])
})

test('test base units', () => {
    
    expect(toBaseUnits(5, 'g')).toBeCloseTo(5, 3)
})


test('test base units', () => {
    
    expect(toBaseUnits(15, 'cup')).toBeCloseTo(3548.82, 5)
})
