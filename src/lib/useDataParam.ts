import { useParams } from 'react-router'
import { isValidDateKey, todayKey, type DateKey } from './dates'

// grabs the date from the url parameter
// it runs the validation function in ./dates helper file 
// if it is a valid date, proceeds
// if it is invalid or malformed somehow, just default to today

export function useDateParam(): DateKey {
    const { date } = useParams<{date : string}>()
    return isValidDateKey(date) ? date : todayKey()
}