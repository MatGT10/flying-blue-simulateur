import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { config, validerConfig } from './lib/config'

if (import.meta.env.DEV) {
  const avertissements = validerConfig(config)
  if (avertissements.length > 0) {
    console.warn('[config.json] Points à compléter :\n- ' + avertissements.join('\n- '))
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
