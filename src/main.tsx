import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { db } from './lib/db'

db.open().catch((err) => {
  console.error('Failed to open MacroDB', err)
})

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Need refresh');
  },
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
