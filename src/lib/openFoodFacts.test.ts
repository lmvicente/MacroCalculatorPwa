import { describe, expect, it } from 'vitest'
import { cleanBarcode, parseOpenFoodFactsProduct } from './openFoodFacts'

describe('Open Food Facts import', () => {
  it('normalizes typed barcode characters', () => {
    expect(cleanBarcode('0 366-320-42842')).toBe('036632042842')
  })

  it('uses serving nutrition when a serving unit is available', () => {
    const imported = parseOpenFoodFactsProduct({
      code: '036632042842',
      product_name: 'Oikos Pro Strawberry Banana',
      brands: 'Oikos',
      serving_size: '1 bottle (207 ml)',
      serving_quantity: 207,
      serving_quantity_unit: 'ml',
      nutriments: {
        'energy-kcal_serving': 120,
        proteins_serving: 23,
        carbohydrates_serving: 10,
        fat_serving: 1.5,
        fiber_serving: 0,
      },
    })

    expect(imported.defaultAmount).toBe(207)
    expect(imported.defaultUnit).toBe('ml')
    expect(imported.food.unitFamily).toBe('volume')
    expect(imported.food.kcal * 207).toBeCloseTo(120)
    expect(imported.food.protein * 207).toBeCloseTo(23)
  })

  it('falls back to a 100 gram basis', () => {
    const imported = parseOpenFoodFactsProduct({
      code: '12345678',
      product_name: 'Test food',
      nutriments: {
        'energy-kcal_100g': 240,
        proteins_100g: 10,
      },
    })

    expect(imported.defaultAmount).toBe(100)
    expect(imported.defaultUnit).toBe('g')
    expect(imported.food.kcal * 100).toBe(240)
  })
})
