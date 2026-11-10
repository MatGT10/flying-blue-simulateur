import { useEffect, useState } from 'react'
import { appliquerTheme, themeActuel, themeChoisi, themeSysteme, type Theme } from '../lib/theme'

/** Bascule clair / sombre. Sans choix explicite, le site suit le réglage du téléphone. */
export default function BoutonTheme({ className = '', libelle = false }: { className?: string; libelle?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => themeActuel())

  // Tant que l'utilisateur n'a rien choisi, on suit les changements du système.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const suivre = () => {
      if (themeChoisi()) return
      const t = themeSysteme()
      appliquerTheme(t, false)
      setTheme(t)
    }
    media.addEventListener('change', suivre)
    return () => media.removeEventListener('change', suivre)
  }, [])

  const basculer = () => {
    const t: Theme = theme === 'sombre' ? 'clair' : 'sombre'
    appliquerTheme(t, true)
    setTheme(t)
  }
  const sombre = theme === 'sombre'

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={sombre ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-pressed={sombre}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-ios-fill text-ios-blue active:opacity-70 ${libelle ? 'h-9 px-4 text-[14px] font-semibold' : 'h-8 w-8'} ${className}`}
    >
      {sombre ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
      {libelle && (sombre ? 'Mode clair' : 'Mode sombre')}
    </button>
  )
}
