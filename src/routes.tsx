import { createBrowserRouter, redirect } from 'react-router'
import { DayView } from './screens/DayView'
import { EntrySheet } from './screens/EntrySheet'
import { FoodSheet } from './screens/FoodSheet'
import { GoalsPage } from './screens/GoalsPage'
import { SettingsPage } from './screens/SettingsPage'
import { TrendsPage } from './screens/TrendsPage'
import { todayKey } from './lib/dates'
import { NewFoodSheet } from './screens/NewFoodSheet'

export const router = createBrowserRouter([
  {
    path: '/',
    // A loader, not <Navigate> — runs at navigation time, so "today" is
    // correct even if the app has been open since yesterday.
    loader: () => redirect(`/day/${todayKey()}`, 302),
  },
  {
    path: '/day/:date',
    Component: DayView,
    // Nested, so they render through DayView's <Outlet/> with the day
    // still visible behind them.
    children: [
      { path: 'add', Component: EntrySheet },
      { path: 'add/new', Component: NewFoodSheet },
      { path: 'food/:foodId', Component: FoodSheet },
    ],
  },
  { path: '/trends', Component: TrendsPage },
  { path: '/goals', Component: GoalsPage },
  { path: '/settings', Component: SettingsPage },
  { path: '*', loader: () => redirect(`/day/${todayKey()}`, 302) },
])