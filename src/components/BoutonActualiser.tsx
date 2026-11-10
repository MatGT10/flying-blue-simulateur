import { useState } from 'react'
import { actualiser, estEnModeAppli } from '../lib/appli'

/** Visible seulement en mode application : sans barre d'adresse, c'est le seul moyen de recharger. */
export default function BoutonActualiser() {
  const [visible] = useState(() => estEnModeAppli())
  const [enCours, setEnCours] = useState(false)
  if (!visible) return null
  return (
    <button
      type="button"
      onClick={() => {
        setEnCours(true)
        actualiser()
      }}
      aria-label="Actualiser le site"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ios-fill text-ios-blue active:opacity-70"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`h-4.5 w-4.5 ${enCours ? 'animate-spin' : ''}`} aria-hidden="true">
        <path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v5h-5" />
      </svg>
    </button>
  )
}
