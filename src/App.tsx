import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './routes'
import { watchSystemTheme } from './lib/theme'

export default function App() {
  useEffect(() => watchSystemTheme(), [])

  return <RouterProvider router={router} />
}
