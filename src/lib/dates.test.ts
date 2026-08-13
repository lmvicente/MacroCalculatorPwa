import { expect, test } from 'vitest'
import { isValidDateKey, toDateKey, todayKey } from './dates'

test('test toDateKey', () => {
    
    expect(toDateKey(new Date("August 12 2026"))).toBe('2026-08-12')
})


test('test grabbing current date', () => {
    
    expect(todayKey()).toBe('2026-08-12')
})


test('vaild date', () => {
    
    expect(isValidDateKey('2026-08-12')).toBe(true)
})

test('invaild date', () => {
    
    expect(isValidDateKey('2027-02-31')).toBe(false)
})