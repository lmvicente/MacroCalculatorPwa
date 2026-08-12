export type DateKey = string // 'YYYY-MM-DD'

// file to help me handle dates and their structures 

// takes in the date and normalizes it into yyyy-mm-dd structure
export function toDateKey(d: Date): DateKey {
    const y = d.getFullYear();
    const m = String(d.getMonth()).padStart(2, '0') //pad 2 to get 01, 02, etc.
    const day = String(d.getDate()).padStart(2, '0') //pad 2 to get 04, etc.

    return `${y}-${m}-${day}`
}

//take in the from date and turns it into an array, then it splits it, making each a number. then it returns a new date
export function fromDateKey(key:DateKey): Date {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y, m-1, d)
}

// grabs todays date. we do not want this cached just in case the app is open past midnight
export function todayKey(): DateKey {
    return toDateKey(new Date())
}

//takes in the datekey that is past to it and a number. it return a new DateKey after adding the n number to the given date
export function addDays(key: DateKey, n: number): DateKey {
    const d = fromDateKey(key)
    d.setDate(d.getDate() + n)
    return toDateKey(d)
}


// uses regex to make sure it is a valid date (for example, feb 31 is not a real date)
export function isValidDateKey(key: string | undefined): key is DateKey {
    if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false
    return toDateKey(fromDateKey(key)) === key
}

/// DISPLAY FUNCTIONS 

export function weekDayName(key: DateKey): string {
    return fromDateKey(key).toLocaleDateString(undefined, {weekday: 'long'})
}

/** 'August 11' */
export function monthDay(key: DateKey): string {
  return fromDateKey(key).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
}
 
/** ISO week number — for the 'Week 18' line in the header. */
export function isoWeek(key: DateKey): number {
  const d = fromDateKey(key)
  // Shift to this week's Thursday; ISO weeks belong to whichever year that lands in.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const firstThursday = new Date(d.getFullYear(), 0, 4)
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7))
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * 86400000))
}
 
/** 'Today' / 'Yesterday' / 'Tuesday' for the day header. */
export function friendlyDay(key: DateKey): string {
  const today = todayKey()
  if (key === today) return 'Today'
  if (key === addDays(today, -1)) return 'Yesterday'
  if (key === addDays(today, 1)) return 'Tomorrow'
  return weekDayName(key)
}