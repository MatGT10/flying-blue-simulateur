import { useMemo, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { COLONNE_PLUS, NB_ONGLETS, colonneOnglet, pagesMenu } from '../lib/pages'
import BoutonTheme from './BoutonTheme'
import Icone from './Icone'
import FeuillePlus from './nav/FeuillePlus'
import TitrePage from './nav/TitrePage'
import { useBulleRessort } from './nav/useBulleRessort'
import { usePiluleGlissante } from './nav/usePiluleGlissante'

/** Les 4 premières pages ont leur onglet ; les autres passent par « Plus ». */
const ONGLETS = pagesMenu.slice(0, NB_ONGLETS)

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

export default function Nav() {
  const [plus, setPlus] = useState(false)
  const [apercuPlus, setApercuPlus] = useState(false)
  const { pathname } = useLocation()
  // Colonne de la bulle de verre : l'onglet de la page, ou « Plus » quand sa feuille est ouverte.
  const colonne = plus ? COLONNE_PLUS : colonneOnglet(pathname)
  const pilule = useRef<HTMLUListElement>(null)
  const actions = useMemo(
    () => ({ ouvrirPlus: () => setPlus(true), debutApercuPlus: () => setApercuPlus(true), finApercuPlus: () => setApercuPlus(false) }),
    [],
  )
  useBulleRessort(pilule, colonne)
  usePiluleGlissante(pilule, colonne, actions)

  return (
    <>
      {/* Barre du haut : translucide, titre centré sur mobile, onglets sur ordinateur */}
      <header className="sticky top-0 z-20 border-b border-ios-sep/60 bg-carte/80 backdrop-blur-xl">
        <div className="relative mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:hidden" style={{ minHeight: 44 }}>
          <NavLink to="/" className="inline-flex items-center text-ios-blue text-[15px]" onClick={() => setPlus(false)}>
            <Icone nom="avion" className="mr-1 h-4 w-4" />
            Flying Blue
          </NavLink>
          <TitrePage pathname={pathname} />
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

      <FeuillePlus ouverte={plus} apercu={apercuPlus} onFermer={() => setPlus(false)} />

      {/* Barre d'onglets (mobile) : pilule flottante en verre */}
      <nav
        className="barre-onglets fixed inset-x-0 bottom-0 z-20 flex justify-center sm:hidden pointer-events-none"
        data-sans-geste
        aria-label="Navigation principale"
      >
        <ul
          ref={pilule}
          className="glass pointer-events-auto relative grid h-[var(--onglets-hauteur)] w-full max-w-md grid-cols-5 items-center rounded-full px-1.5"
          style={{ '--onglet-position': colonne } as React.CSSProperties}
        >
          {/* Bulle de verre sous l'onglet actif : glisse d'un onglet à l'autre, et suit le doigt pendant un balayage. */}
          <li aria-hidden="true" className="indicateur-onglet" data-cachee={colonne < 0 ? 'true' : undefined} />
          {ONGLETS.map((p, i) => (
            <li key={p.to} className="relative z-10">
              <NavLink
                to={p.to}
                end={p.to === '/'}
                onClick={() => setPlus(false)}
                className="onglet-lien flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium"
                style={{ '--i': i } as React.CSSProperties}
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
              className="onglet-lien flex w-full flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium"
              style={{ '--i': COLONNE_PLUS } as React.CSSProperties}
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
