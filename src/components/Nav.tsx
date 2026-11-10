import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { COLONNE_PLUS, NB_ONGLETS, colonneOnglet, pages, pagesMenu, sensEntre, type Sens } from '../lib/pages'
import { annoncerPilule } from '../lib/pilule'
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

/**
 * Titre de la page dans le bandeau mobile. Pendant un balayage, les titres des pages voisines sont
 * posés de part et d'autre et la piste suit le doigt (variable --balayage-progression posée par la
 * scène). À l'arrivée par un onglet, le nouveau titre glisse depuis le côté correspondant.
 */
function TitrePage({ pathname }: { pathname: string }) {
  const [etat, setEtat] = useState<{ path: string; anim: Sens | 'aucune' }>({ path: pathname, anim: 'aucune' })
  if (etat.path !== pathname) {
    // Arrivée par balayage : le titre a déjà glissé avec la page, pas d'animation.
    const parBalayage = document.documentElement.classList.contains('balayage')
    setEtat({ path: pathname, anim: parBalayage ? 'aucune' : sensEntre(etat.path, pathname) })
  }
  const courante = pages.find((p) => p.to === pathname) ?? pages[0]
  const i = pagesMenu.findIndex((p) => p.to === pathname)
  const precedente = i > 0 ? pagesMenu[i - 1] : null
  const suivante = i >= 0 ? pagesMenu[i + 1] ?? null : null
  return (
    <span className="titre-page" aria-hidden={false}>
      <span className="titre-piste">
        {precedente && <span className="titre-voisin titre-voisin-precedent" style={{ transform: 'translateX(-70%)' }} aria-hidden="true">{precedente.label}</span>}
        <span key={pathname} className={`titre-courant ${etat.anim !== 'aucune' ? `titre-entre-${etat.anim}` : ''}`}>{courante.label}</span>
        {suivante && <span className="titre-voisin titre-voisin-suivant" style={{ transform: 'translateX(70%)' }} aria-hidden="true">{suivante.label}</span>}
      </span>
    </span>
  )
}

/**
 * Bulle déplaçable : on la maintient et on la fait coulisser le long de la pilule ; elle part de sa
 * colonne et suit le déplacement du doigt. Pendant ce temps, la scène fait coulisser les pages sous
 * elle (événements de src/lib/pilule.ts). Au relâchement, elle s'aimante sur l'onglet le plus proche :
 * la page sous la bulle se fixe, ou la feuille « Plus » s'ouvre. Un toucher sans mouvement reste un clic.
 */
function usePiluleGlissante(pilule: React.RefObject<HTMLUListElement | null>, colonneCourante: number, ouvrirPlus: () => void) {
  const colonneRef = useRef(colonneCourante)
  useEffect(() => {
    colonneRef.current = colonneCourante
  }, [colonneCourante])

  useEffect(() => {
    const ul = pilule.current
    if (!ul) return
    const g: { depart: { x: number; colonne: number } | null; actif: boolean; minuteur: number | null } = { depart: null, actif: false, minuteur: null }
    const largeurColonne = () => (ul.getBoundingClientRect().width - 12) / 5 // px-1.5 de chaque côté

    const position = (x: number, d: { x: number; colonne: number }) => Math.max(0, Math.min(4, d.colonne + (x - d.x) / largeurColonne()))

    const onMove = (e: TouchEvent) => {
      const d = g.depart
      if (!d) return
      const x = e.touches[0].clientX
      if (!g.actif) {
        if (Math.abs(x - d.x) < 6) return
        g.actif = true
        if (g.minuteur !== null) window.clearTimeout(g.minuteur)
        ul.classList.add('pilule-glisse')
        ul.classList.remove('pilule-fin')
        annoncerPilule({ phase: 'debut' })
      }
      if (e.cancelable) e.preventDefault() // ni défilement, ni clic après le geste
      // Seul le déplacement horizontal compte : monter ou descendre le doigt ne change rien.
      const p = position(x, d)
      ul.style.setProperty('--onglet-glisse', String(p))
      annoncerPilule({ phase: 'mouvement', position: p })
    }
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      g.depart = { x: e.touches[0].clientX, colonne: Math.max(0, colonneRef.current) }
      g.actif = false
      ul.addEventListener('touchmove', onMove, { passive: false })
    }
    const finir = (e: TouchEvent | null) => {
      ul.removeEventListener('touchmove', onMove)
      const d = g.depart
      g.depart = null
      if (!d || !g.actif) return
      g.actif = false
      const x = e?.changedTouches[0]?.clientX
      const colonne = x === undefined ? d.colonne : Math.round(position(x, d))
      // La bulle s'aimante sur la colonne ; la scène fixe la page correspondante.
      ul.classList.add('pilule-fin')
      ul.style.setProperty('--onglet-glisse', String(colonne))
      if (colonne === COLONNE_PLUS) {
        ouvrirPlus()
        annoncerPilule({ phase: 'annule' })
      } else {
        annoncerPilule({ phase: 'fin', colonne })
      }
      g.minuteur = window.setTimeout(() => {
        ul.classList.remove('pilule-glisse', 'pilule-fin')
        ul.style.removeProperty('--onglet-glisse')
        g.minuteur = null
      }, 340)
    }
    const onEnd = (e: TouchEvent) => finir(e)
    const onCancel = () => finir(null)

    ul.addEventListener('touchstart', onStart, { passive: true })
    ul.addEventListener('touchend', onEnd, { passive: true })
    ul.addEventListener('touchcancel', onCancel, { passive: true })
    return () => {
      ul.removeEventListener('touchstart', onStart)
      ul.removeEventListener('touchend', onEnd)
      ul.removeEventListener('touchcancel', onCancel)
      ul.removeEventListener('touchmove', onMove)
      if (g.minuteur !== null) window.clearTimeout(g.minuteur)
    }
  }, [pilule, ouvrirPlus])
}

export default function Nav() {
  const [plus, setPlus] = useState(false)
  const { pathname } = useLocation()
  // Colonne de la bulle de verre : l'onglet de la page, ou « Plus » quand sa feuille est ouverte.
  const colonne = plus ? COLONNE_PLUS : colonneOnglet(pathname)
  const pilule = useRef<HTMLUListElement>(null)
  const ouvrirPlus = useCallback(() => setPlus(true), [])
  usePiluleGlissante(pilule, colonne, ouvrirPlus)

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

      <FeuillePlus ouverte={plus} onFermer={() => setPlus(false)} />

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
