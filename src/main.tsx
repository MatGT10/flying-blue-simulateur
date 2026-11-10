import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { config, validerConfig } from './lib/config'
import { inject } from '@vercel/analytics'
import { estEnModeAppli } from './lib/appli'
import { dernierePage } from './lib/defilement'
import { pages } from './lib/pages'

// Le défilement est restauré par la scène (App.tsx), pas par le navigateur.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// Application : aucun zoom, même au pincement (Safari iOS passe par ces événements de geste).
if (estEnModeAppli()) {
  for (const nom of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(nom, (e) => e.preventDefault(), { passive: false })
  }
}

// Application ouverte depuis l'écran d'accueil : on reprend sur la dernière page visitée.
if (estEnModeAppli() && window.location.pathname === '/') {
  const derniere = dernierePage()
  if (derniere !== '/' && pages.some((p) => p.to === derniere)) {
    window.history.replaceState(null, '', derniere + window.location.search)
  }
}

// Statistiques de visite Vercel (anonymes, sans cookie). À activer aussi dans l'onglet Analytics du projet Vercel.
inject({ mode: import.meta.env.DEV ? 'development' : 'production' })

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
