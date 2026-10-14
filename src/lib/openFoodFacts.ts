import type { Food, Macros, Unit } from './types'
import { FAMILY_OF, toBaseUnits } from './units'

const API_ROOT = 'https://world.openfoodfacts.org/api/v2/product'
const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'brands',
  'image_front_small_url',
  'serving_size',
  'serving_quantity',
  'serving_quantity_unit',
  'nutrition_data_per',
  'nutriments',
].join(',')

type Nutriments = Record<string, number | string | undefined>

interface ApiProduct {
  code?: string
  product_name?: string
  brands?: string
  image_front_small_url?: string
  serving_size?: string
  serving_quantity?: number | string
  serving_quantity_unit?: string
  nutrition_data_per?: string
  nutriments?: Nutriments
}

interface ApiResponse {
  status?: number
  product?: ApiProduct
}

export interface ImportedFood {
  food: Omit<Food, 'id' | 'lastUsedAt'>
  defaultAmount: number
  defaultUnit: Unit
  servingLabel: string
}

export class ProductNotFoundError extends Error {
  constructor() {
    super('We could not find a product with that barcode.')
  }
}

export function cleanBarcode(value: string): string {
  return value.replace(/\D/g, '')
}

function numberValue(value: number | string | undefined): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function apiUnit(value: string | undefined): Unit | null {
  switch (value?.trim().toLowerCase()) {
    case 'g':
      return 'g'
    case 'oz':
      return 'oz'
    case 'ml':
    case 'milliliter':
    case 'milliliters':
      return 'ml'
    case 'fl oz':
    case 'floz':
      return 'floz'
    default:
      return null
  }
}

function macrosForSuffix(nutriments: Nutriments, suffix: '_serving' | '_100g'): Macros | null {
  const kcal =
    numberValue(nutriments[`energy-kcal${suffix}`]) ??
    numberValue(nutriments[`energy-kcal_value${suffix}`])
  if (kcal == null) return null

  return {
    kcal,
    protein: numberValue(nutriments[`proteins${suffix}`]) ?? 0,
    carbs: numberValue(nutriments[`carbohydrates${suffix}`]) ?? 0,
    fat: numberValue(nutriments[`fat${suffix}`]) ?? 0,
    fiber: numberValue(nutriments[`fiber${suffix}`]) ?? 0,
  }
}

export function parseOpenFoodFactsProduct(product: ApiProduct): ImportedFood {
  const name = product.product_name?.trim()
  const barcode = cleanBarcode(product.code ?? '')
  if (!name || !barcode) throw new Error('This product is missing a name or barcode.')

  const servingAmount = numberValue(product.serving_quantity)
  const servingUnit = apiUnit(product.serving_quantity_unit)
  const servingMacros = macrosForSuffix(product.nutriments ?? {}, '_serving')
  const per100gMacros = macrosForSuffix(product.nutriments ?? {}, '_100g')

  let totals: Macros
  let defaultAmount: number
  let defaultUnit: Unit

  if (servingMacros && servingAmount && servingUnit) {
    totals = servingMacros
    defaultAmount = servingAmount
    defaultUnit = servingUnit
  } else if (per100gMacros) {
    totals = per100gMacros
    defaultAmount = 100
    defaultUnit = 'g'
  } else {
    throw new Error('This product does not include usable calorie information.')
  }

  const baseAmount = toBaseUnits(defaultAmount, defaultUnit)
  const perBase = Object.fromEntries(
    Object.entries(totals).map(([key, value]) => [key, value / baseAmount]),
  ) as unknown as Macros

  return {
    food: {
      ...perBase,
      name,
      brand: product.brands?.split(',')[0]?.trim() || undefined,
      barcode,
      imageUrl: product.image_front_small_url,
      dataSource: 'open-food-facts',
      unitFamily: FAMILY_OF[defaultUnit],
      countLabel: product.serving_size?.trim() || undefined,
    },
    defaultAmount,
    defaultUnit,
    servingLabel:
      product.serving_size?.trim() || `${defaultAmount} ${defaultUnit}`,
  }
}

export async function fetchFoodByBarcode(
  barcodeInput: string,
  signal?: AbortSignal,
): Promise<ImportedFood> {
  const barcode = cleanBarcode(barcodeInput)
  if (barcode.length < 8 || barcode.length > 14) {
    throw new Error('Enter a barcode with 8 to 14 digits.')
  }

  const response = await fetch(
    `${API_ROOT}/${encodeURIComponent(barcode)}?fields=${encodeURIComponent(PRODUCT_FIELDS)}`,
    { signal },
  )
  if (!response.ok) throw new Error('Open Food Facts is unavailable right now. Try again.')

  const data = (await response.json()) as ApiResponse
  if (data.status !== 1 || !data.product) throw new ProductNotFoundError()
  return parseOpenFoodFactsProduct(data.product)
}
