import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import BoutonActualiser from './BoutonActualiser'

export const pages = [
  { to: '/', label: 'Accueil', titre: 'Les miles Flying Blue expliqués simplement · Simulateur et guide', icone: 'maison' },
  { to: '/simulateur', label: 'Simulateur', titre: 'Simulateur de miles Flying Blue · Silver, Gold ou Platinum ?', icone: 'calcul' },
  { to: '/valeur', label: 'Payer en miles ?', titre: 'Quel vol payer en miles ? Valeur d’un mile · Simulateur Flying Blue', icone: 'avion' },
  { to: '/offre', label: 'Offre', titre: 'Offre du moment et parrainage · Simulateur Flying Blue', icone: 'cadeau' },
  { to: '/partenaires', label: 'Partenaires', titre: 'Gagner des miles sans prendre l’avion · Partenaires Flying Blue', icone: 'plus' },
  { to: '/comparatif', label: 'Comparatif', titre: 'Rentabilité et avantages des cartes · Simulateur Flying Blue', icone: 'plus' },
  { to: '/inscription', label: 'Inscription', titre: 'Comment s’inscrire, étape par étape · Simulateur Flying Blue', icone: 'plus' },
  { to: '/faq', label: 'FAQ', titre: 'Questions fréquentes et lexique · Simulateur Flying Blue', icone: 'plus' },
]

/** Les 4 premières pages ont leur onglet ; les autres passent par « Plus ». */
const ONGLETS = pages.slice(0, 4)
const AUTRES = pages.slice(4)

function Icone({ nom, className = '' }: { nom: string; className?: string }) {
  const c = `h-6 w-6 ${className}`
  switch (nom) {
    case 'maison':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" />
        </svg>
      )
    case 'calcul':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden="true">
          <rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0" />
        </svg>
      )
    case 'avion':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden="true">
          <path d="M3 13l7 1 4 7 2-1-1-7 5-3a2 2 0 0 0-2-3l-5 2-6-4-2 1 4 5-6 2z" />
        </svg>
      )
    case 'cadeau':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden="true">
          <rect x="3" y="8" width="18" height="5" rx="1" /><path d="M5 13v8h14v-8" /><path d="M12 8v13" /><path d="M12 8c-2-4-6-4-6-1s4 1 6 1zm0 0c2-4 6-4 6-1s-4 1-6 1z" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={c} aria-hidden="true">
          <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
        </svg>
      )
  }
}

export default function Nav() {
  const [plus, setPlus] = useState(false)
  const { pathname } = useLocation()
  const courante = pages.find((p) => p.to === pathname) ?? pages[0]
  const dansPlus = AUTRES.some((p) => p.to === pathname)

  return (
    <>
      {/* Barre du haut : translucide, titre centré sur mobile, onglets sur ordinateur */}
      <header className="sticky top-0 z-20 border-b border-ios-sep/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:hidden" style={{ minHeight: 44 }}>
          <NavLink to="/" className="text-ios-blue text-[15px]" onClick={() => setPlus(false)}>
            ✈︎ Flying Blue
          </NavLink>
          <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-ios-label">{courante.label}</span>
          <span className="flex w-20 justify-end"><BoutonActualiser /></span>
        </div>
        <div className="mx-auto hidden w-full max-w-3xl flex-wrap items-center gap-x-0.5 gap-y-0 px-4 sm:flex">
          <NavLink to="/" className="shrink-0 py-2.5 pr-2 text-[15px] font-semibold text-ios-label">
            ✈︎ Flying Blue
          </NavLink>
          <BoutonActualiser />
          {pages.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              end={p.to === '/'}
              className={({ isActive }) =>
                `shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[14px] transition ${isActive ? 'bg-ios-blue text-white' : 'text-ios-blue hover:bg-ios-fill'}`
              }
            >
              {p.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Feuille « Plus » (mobile) */}
      {plus && (
        <div className="fixed inset-0 z-30 sm:hidden" role="dialog" aria-modal="true" aria-label="Plus de pages">
          <button type="button" className="absolute inset-0 bg-black/30" aria-label="Fermer" onClick={() => setPlus(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-ios-bg p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ios-sep" aria-hidden="true" />
            <ul className="overflow-hidden rounded-2xl bg-white">
              {AUTRES.map((p, i) => (
                <li key={p.to} className={i > 0 ? 'border-t border-ios-sep/60' : ''}>
                  <NavLink
                    to={p.to}
                    onClick={() => setPlus(false)}
                    className={({ isActive }) => `flex items-center justify-between px-4 py-3.5 text-[17px] ${isActive ? 'text-ios-blue' : 'text-ios-label'}`}
                  >
                    {p.label}
                    <span className="text-ios-sep" aria-hidden="true">›</span>
                  </NavLink>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setPlus(false)}
              className="mt-3 w-full rounded-2xl bg-white py-3.5 text-[17px] font-semibold text-ios-blue"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Barre d'onglets (mobile) */}
      <nav
        className="barre-onglets fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 sm:hidden pointer-events-none"
        data-sans-geste
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        aria-label="Navigation principale"
      >
        <ul className="glass pointer-events-auto grid w-full max-w-md grid-cols-5 rounded-full px-1.5 py-1.5">
          {ONGLETS.map((p) => (
            <li key={p.to}>
              <NavLink
                to={p.to}
                end={p.to === '/'}
                onClick={() => setPlus(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition ${
                    isActive && !plus ? 'glass-active text-ios-blue' : 'text-ios-label/70'
                  }`
                }
              >
                <Icone nom={p.icone} />
                <span className="truncate max-w-full px-1">{p.label === 'Payer en miles ?' ? 'Vols' : p.label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setPlus((o) => !o)}
              aria-expanded={plus}
              className={`flex w-full flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition ${plus || dansPlus ? 'glass-active text-ios-blue' : 'text-ios-label/70'}`}
            >
              <Icone nom="plus" />
              <span>Plus</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
