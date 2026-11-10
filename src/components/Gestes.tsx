import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { actualiser, estDerniereVersion, estEnModeAppli, marquerSecondeTentative, secondeTentative, vientDEtreActualise } from '../lib/appli'
import { pages } from '../lib/pages'

const SEUIL_TIRAGE = 80 // px à tirer pour déclencher l'actualisation
const TIRAGE_MAX = SEUIL_TIRAGE * 1.6 // au-delà, le cercle ne descend plus
const SEUIL_BALAYAGE = 70 // px horizontaux pour changer de page
const CIRCONFERENCE = 56.5 // 2π × 9, rayon de l'arc de progression

/**
 * Gestes tactiles :
 * - en mode application, tirer vers le bas depuis le haut de page actualise (cercle de progression) ;
 * - sur mobile, balayer vers la gauche ou la droite change de page.
 * Affiche aussi la bulle « À jour » après une actualisation.
 *
 * Fluidité : le cercle est déplacé directement dans le DOM (transform, les événements
 * touchmove étant déjà alignés sur les images par le navigateur), sans re-rendu React pendant le geste, et l'écouteur bloquant `touchmove` n'existe que
 * pendant un tirage réel : le défilement ordinaire n'est jamais freiné.
 */
export default function Gestes() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [enCours, setEnCours] = useState(false)
  const [aJour, setAJour] = useState(false)

  const cercle = useRef<HTMLDivElement>(null)
  const fleche = useRef<SVGSVGElement>(null)
  const arc = useRef<SVGCircleElement>(null)
  const enCoursRef = useRef(false)
  const navigateRef = useRef(navigate)
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    navigateRef.current = navigate
    pathnameRef.current = pathname
  }, [navigate, pathname])

  // Après une actualisation déclenchée par le site : on vérifie que la version chargée est bien
  // la dernière publiée. Si oui, bulle « À jour » (2,5 s, puis elle s'efface vers le haut).
  // Si non, on recharge une seconde fois (une seule), sinon on n'affiche rien.
  const bulleDecidee = useRef<boolean | null>(null)
  useEffect(() => {
    if (bulleDecidee.current === null) bulleDecidee.current = vientDEtreActualise()
    if (!bulleDecidee.current) return
    const etat = { annule: false }
    const minuteurs: number[] = []
    estDerniereVersion().then((ok) => {
      if (etat.annule) return
      if (ok) {
        marquerSecondeTentative(false)
        minuteurs.push(window.setTimeout(() => setAJour(true), 350))
        minuteurs.push(window.setTimeout(() => setAJour(false), 350 + 2500))
      } else if (!secondeTentative()) {
        marquerSecondeTentative(true)
        actualiser()
      } else {
        marquerSecondeTentative(false)
      }
    })
    return () => {
      etat.annule = true
      minuteurs.forEach((m) => window.clearTimeout(m))
    }
  }, [])

  useEffect(() => {
    const appli = estEnModeAppli()
    const mobile = () => window.innerWidth < 640
    // État du geste en cours, hors React : mis à jour à chaque événement tactile.
    const g: { depart: { x: number; y: number; t: number; tirable: boolean; balayable: boolean } | null; tirage: number } = {
      depart: null,
      tirage: 0,
    }

    /** Dessine l'état du cercle directement dans le DOM. */
    const dessiner = (anime: boolean) => {
      const c = cercle.current
      if (!c) return
      const p = Math.min(1, g.tirage / SEUIL_TIRAGE)
      const actif = enCoursRef.current
      c.style.transition = anime ? 'transform 200ms ease-out, opacity 200ms ease-out' : 'none'
      c.style.opacity = g.tirage > 4 || actif ? '1' : '0'
      c.style.transform = `translate(-50%, ${Math.round(g.tirage * 0.5)}px)`
      if (fleche.current) fleche.current.style.transform = actif ? '' : `rotate(${p * 270}deg)`
      arc.current?.setAttribute('stroke-dasharray', `${(actif ? 0.3 : p) * CIRCONFERENCE} ${CIRCONFERENCE}`)
    }

    const onMove = (e: TouchEvent) => {
      const d = g.depart
      if (!d || !d.tirable) return
      const t = e.touches[0]
      const dx = t.clientX - d.x
      const dy = t.clientY - d.y
      // Tirage vers le bas : seulement si le mouvement est franchement vertical
      if (dy > 0 && Math.abs(dx) < dy / 2 && window.scrollY <= 0) {
        g.tirage = Math.min(TIRAGE_MAX, dy * 0.6)
        dessiner(false)
        if (dy > 10 && e.cancelable) e.preventDefault()
      }
    }
    const retirerMove = () => window.removeEventListener('touchmove', onMove)

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const cible = e.target instanceof Element ? e.target : null
      // Ni dans un champ, ni dans la feuille « Plus » (un dialogue), ni dans une zone marquée sans geste.
      const dansZoneProtegee = !!cible?.closest('[data-sans-geste], [role="dialog"], input, textarea, select')
      const dansZoneSansGeste = dansZoneProtegee || !!cible?.closest('button, a')
      const t = e.touches[0]
      const tirable = appli && window.scrollY <= 0 && !dansZoneProtegee && !enCoursRef.current
      g.depart = { x: t.clientX, y: t.clientY, t: Date.now(), tirable, balayable: mobile() && !dansZoneSansGeste }
      // L'écouteur bloquant n'est posé que si un tirage est possible.
      if (tirable) window.addEventListener('touchmove', onMove, { passive: false })
    }

    const onCancel = () => {
      retirerMove()
      g.depart = null
      g.tirage = 0
      dessiner(true)
    }

    const onEnd = (e: TouchEvent) => {
      retirerMove()
      const d = g.depart
      g.depart = null
      const v = g.tirage
      if (v >= SEUIL_TIRAGE && !enCoursRef.current) {
        enCoursRef.current = true
        g.tirage = SEUIL_TIRAGE
        setEnCours(true)
        dessiner(true)
        window.setTimeout(actualiser, 250)
        return
      }
      g.tirage = 0
      dessiner(true)
      if (!d || !d.balayable) return
      const t = e.changedTouches[0]
      const dx = t.clientX - d.x
      const dy = t.clientY - d.y
      const duree = Date.now() - d.t
      if (Math.abs(dx) >= SEUIL_BALAYAGE && Math.abs(dy) < Math.abs(dx) / 2 && duree < 600) {
        const i = pages.findIndex((p) => p.to === pathnameRef.current)
        if (i < 0) return
        const suivante = dx < 0 ? pages[i + 1] : pages[i - 1]
        if (suivante) navigateRef.current(suivante.to)
      }
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    window.addEventListener('touchcancel', onCancel, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onCancel)
      retirerMove()
    }
  }, [])

  return (
    <>
      {/* Cercle d'actualisation : position et opacité pilotées directement pendant le geste */}
      <div
        ref={cercle}
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 z-40"
        style={{ top: 'calc(env(safe-area-inset-top) + 56px)', opacity: 0, transform: 'translate(-50%, 0)' }}
      >
        <div className="glass flex h-11 w-11 items-center justify-center rounded-full">
          <svg ref={fleche} viewBox="0 0 24 24" className={`h-6 w-6 text-ios-blue ${enCours ? 'animate-spin' : ''}`}>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
            <circle ref={arc} cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`0 ${CIRCONFERENCE}`} transform="rotate(-90 12 12)" />
          </svg>
        </div>
      </div>

      {/* Bulle « À jour » */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-400 ease-out ${aJour ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
        style={{ top: 'calc(env(safe-area-inset-top) + 60px)' }}
      >
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold text-ios-label">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ios-green text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true"><path d="M5 12l4 4L19 6" /></svg>
          </span>
          {aJour ? 'À jour' : ''}
        </div>
      </div>
    </>
  )
}
