import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { COLONNE_PLUS, NB_ONGLETS, colonneOnglet, pages, pagesMenu } from '../lib/pages'
import BoutonTheme from './BoutonTheme'
import Icone from './Icone'

/** Les 4 premières pages ont leur onglet ; les autres passent par « Plus ». */
const ONGLETS = pagesMenu.slice(0, NB_ONGLETS)
const AUTRES = pagesMenu.slice(NB_ONGLETS)

function IconeOnglet({ nom }: { nom: string }) {
  if (nom === 'maison') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" />
      </svg>
    )
  }
  if (nom === 'plus') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
        <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
      </svg>
    )
  }
  return <Icone nom={nom} className="h-6 w-6" />
}

type EtatFeuille = 'fermee' | 'ouverte' | 'sortie'

/** Feuille « Plus » : bulle de verre qui monte, se ferme en la tirant vers le bas (ou en touchant le fond). */
function FeuillePlus({ ouverte, onFermer }: { ouverte: boolean; onFermer: () => void }) {
  const [etat, setEtat] = useState<EtatFeuille>('fermee')
  // L'état dérive de la prop pendant le rendu : ouverture immédiate, fermeture après l'animation de sortie.
  if (ouverte && etat !== 'ouverte') setEtat('ouverte')
  if (!ouverte && etat === 'ouverte') setEtat('sortie')
  useEffect(() => {
    if (etat !== 'sortie') return
    const id = window.setTimeout(() => setEtat('fermee'), 260)
    return () => window.clearTimeout(id)
  }, [etat])

  // Tirage vers le bas piloté directement dans le DOM : aucun re-rendu pendant le geste.
  const feuille = useRef<HTMLDivElement>(null)
  const dialogue = useRef<HTMLDivElement>(null)
  const departY = useRef<number | null>(null)
  const glisse = useRef(0)

  // Tant que la feuille est ouverte, aucun mouvement du doigt ne doit faire défiler ou rebondir la page derrière.
  useEffect(() => {
    const el = dialogue.current
    if (!el) return
    const bloquer = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
    }
    el.addEventListener('touchmove', bloquer, { passive: false })
    return () => el.removeEventListener('touchmove', bloquer)
  }, [etat])

  if (etat === 'fermee') return null

  const onStart = (e: React.TouchEvent) => {
    departY.current = e.touches[0].clientY
    glisse.current = 0
  }
  const onMove = (e: React.TouchEvent) => {
    if (departY.current === null) return
    const dy = Math.max(0, e.touches[0].clientY - departY.current)
    glisse.current = dy
    const el = feuille.current
    if (el) {
      el.style.transition = 'none'
      el.style.transform = `translateY(${dy}px)`
    }
  }
  const onEnd = () => {
    const d = glisse.current
    departY.current = null
    glisse.current = 0
    const el = feuille.current
    if (!el) return
    el.style.transform = ''
    if (d > 80) {
      // L'animation de sortie repart de la position où le doigt a lâché.
      el.style.setProperty('--feuille-depart', `${d}px`)
      onFermer()
    } else {
      el.style.transition = 'transform 200ms ease-out'
    }
  }

  return (
    <div ref={dialogue} className="fixed inset-0 z-30 sm:hidden" role="dialog" aria-modal="true" aria-label="Plus de pages" style={{ touchAction: 'none', overscrollBehavior: 'contain' }}>
      <button
        type="button"
        className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${etat === 'sortie' ? 'opacity-0' : 'opacity-100'}`}
        aria-label="Fermer"
        onClick={onFermer}
      />
      <div
        ref={feuille}
        className={`glass absolute inset-x-3 bottom-3 rounded-[28px] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] ${etat === 'sortie' ? 'feuille-sortie' : 'feuille-entree'}`}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
        data-sans-geste
      >
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ios-label/20" aria-hidden="true" />
        <ul>
          {AUTRES.map((p, i) => (
            <li key={p.to} className={i > 0 ? 'border-t border-ios-label/10' : ''}>
              <NavLink
                to={p.to}
                onClick={onFermer}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3.5 text-[17px] ${isActive ? 'text-ios-blue' : 'text-ios-label'}`
                }
              >
                <span className="flex-1">{p.label}</span>
                <span className="text-ios-gray" aria-hidden="true">›</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Nav() {
  const [plus, setPlus] = useState(false)
  const { pathname } = useLocation()
  const courante = pages.find((p) => p.to === pathname) ?? pages[0]
  const dansPlus = AUTRES.some((p) => p.to === pathname)
  // Colonne de la bulle de verre : l'onglet de la page, ou « Plus » quand sa feuille est ouverte.
  const colonne = plus ? COLONNE_PLUS : colonneOnglet(pathname)

  return (
    <>
      {/* Barre du haut : translucide, titre centré sur mobile, onglets sur ordinateur */}
      <header className="sticky top-0 z-20 border-b border-ios-sep/60 bg-carte/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:hidden" style={{ minHeight: 44 }}>
          <NavLink to="/" className="inline-flex items-center text-ios-blue text-[15px]" onClick={() => setPlus(false)}>
            <Icone nom="avion" className="mr-1 h-4 w-4" />
            Flying Blue
          </NavLink>
          <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-ios-label">{courante.label}</span>
          <BoutonTheme />
        </div>
        <div className="mx-auto hidden w-full max-w-4xl flex-wrap items-center gap-x-0.5 gap-y-0 px-4 sm:flex">
          <NavLink to="/" className="inline-flex shrink-0 items-center py-2.5 pr-2 text-[15px] font-semibold text-ios-label">
            <Icone nom="avion" className="mr-1 h-4 w-4 text-ios-blue" />
            Flying Blue
          </NavLink>
          <BoutonTheme className="mr-1" />
          {pagesMenu.map((p) => (
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

      <FeuillePlus ouverte={plus} onFermer={() => setPlus(false)} />

      {/* Barre d'onglets (mobile) : pilule flottante en verre */}
      <nav
        className="barre-onglets fixed inset-x-0 bottom-0 z-20 flex justify-center sm:hidden pointer-events-none"
        data-sans-geste
        aria-label="Navigation principale"
      >
        <ul
          className="glass pointer-events-auto relative grid h-[var(--onglets-hauteur)] w-full max-w-md grid-cols-5 items-center rounded-full px-1.5"
          style={{ '--onglet-position': colonne } as React.CSSProperties}
        >
          {/* Bulle de verre sous l'onglet actif : glisse d'un onglet à l'autre, et suit le doigt pendant un balayage. */}
          <li aria-hidden="true" className="indicateur-onglet" style={{ opacity: colonne < 0 ? 0 : 1 }} />
          {ONGLETS.map((p) => (
            <li key={p.to} className="relative z-10">
              <NavLink
                to={p.to}
                end={p.to === '/'}
                onClick={() => setPlus(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition-colors ${
                    isActive && !plus ? 'text-ios-blue' : 'text-ios-label/70'
                  }`
                }
              >
                <IconeOnglet nom={p.icone} />
                <span className="truncate max-w-full px-1">{p.label === 'Payer en miles ?' ? 'Vols' : p.label}</span>
              </NavLink>
            </li>
          ))}
          <li className="relative z-10">
            <button
              type="button"
              onClick={() => setPlus((o) => !o)}
              aria-expanded={plus}
              className={`flex w-full flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition-colors ${plus || dansPlus ? 'text-ios-blue' : 'text-ios-label/70'}`}
            >
              <IconeOnglet nom="plus" />
              <span>Plus</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
