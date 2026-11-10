import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { actualiser, estEnModeAppli, vientDEtreActualise } from '../lib/appli'
import { pages } from './Nav'

const SEUIL_TIRAGE = 80 // px à tirer pour déclencher l'actualisation
const SEUIL_BALAYAGE = 70 // px horizontaux pour changer de page

/**
 * Gestes tactiles :
 * - en mode application, tirer vers le bas depuis le haut de page actualise (cercle de progression) ;
 * - sur mobile, balayer vers la gauche ou la droite change de page.
 * Affiche aussi la bulle « À jour » après une actualisation.
 */
export default function Gestes() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [tirage, setTirage] = useState(0)
  const [enCours, setEnCours] = useState(false)
  const [aJour, setAJour] = useState(false)
  const depart = useRef<{ x: number; y: number; t: number; tirable: boolean; balayable: boolean } | null>(null)
  const tirageRef = useRef(0)

  // Bulle « À jour » : apparaît peu après le rechargement, reste 2,5 s, puis disparaît.
  // La décision est prise une seule fois par chargement (ref), même si React relance l'effet.
  const bulleDecidee = useRef<boolean | null>(null)
  useEffect(() => {
    if (bulleDecidee.current === null) bulleDecidee.current = vientDEtreActualise()
    if (!bulleDecidee.current) return
    const apparition = window.setTimeout(() => setAJour(true), 350)
    const disparition = window.setTimeout(() => setAJour(false), 350 + 2500)
    return () => {
      window.clearTimeout(apparition)
      window.clearTimeout(disparition)
    }
  }, [])

  useEffect(() => {
    const appli = estEnModeAppli()
    const mobile = () => window.innerWidth < 640

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const cible = e.target instanceof Element ? e.target : null
      const dansZoneSansGeste = !!cible?.closest('[data-sans-geste], input, textarea, select, button, a')
      const t = e.touches[0]
      depart.current = {
        x: t.clientX,
        y: t.clientY,
        t: Date.now(),
        tirable: appli && window.scrollY <= 0 && !cible?.closest('input, textarea, select'),
        balayable: mobile() && !dansZoneSansGeste,
      }
    }

    const onMove = (e: TouchEvent) => {
      const d = depart.current
      if (!d) return
      const t = e.touches[0]
      const dx = t.clientX - d.x
      const dy = t.clientY - d.y
      // Tirage vers le bas : seulement si le mouvement est franchement vertical
      if (d.tirable && dy > 0 && Math.abs(dx) < dy / 2 && window.scrollY <= 0) {
        const v = Math.min(SEUIL_TIRAGE * 1.6, dy * 0.6)
        tirageRef.current = v
        setTirage(v)
        if (dy > 10 && e.cancelable) e.preventDefault()
      }
    }

    const onEnd = (e: TouchEvent) => {
      const d = depart.current
      depart.current = null
      const v = tirageRef.current
      tirageRef.current = 0
      if (v >= SEUIL_TIRAGE && !enCours) {
        setEnCours(true)
        setTirage(SEUIL_TIRAGE)
        window.setTimeout(actualiser, 250)
        return
      }
      setTirage(0)
      if (!d || !d.balayable) return
      const t = e.changedTouches[0]
      const dx = t.clientX - d.x
      const dy = t.clientY - d.y
      const duree = Date.now() - d.t
      if (Math.abs(dx) >= SEUIL_BALAYAGE && Math.abs(dy) < Math.abs(dx) / 2 && duree < 600) {
        const i = pages.findIndex((p) => p.to === pathname)
        if (i < 0) return
        const suivante = dx < 0 ? pages[i + 1] : pages[i - 1]
        if (suivante) {
          document.documentElement.dataset.sens = dx < 0 ? 'gauche' : 'droite'
          navigate(suivante.to)
        }
      }
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [navigate, pathname, enCours])

  const progression = Math.min(1, tirage / SEUIL_TIRAGE)
  const visible = tirage > 4 || enCours

  return (
    <>
      {/* Cercle d'actualisation */}
      <div
        aria-hidden={!visible}
        className="pointer-events-none fixed left-1/2 z-40 -translate-x-1/2 transition-opacity"
        style={{ top: `calc(env(safe-area-inset-top) + 56px + ${Math.round(tirage * 0.5)}px)`, opacity: visible ? 1 : 0 }}
      >
        <div className="glass flex h-11 w-11 items-center justify-center rounded-full">
          <svg viewBox="0 0 24 24" className={`h-6 w-6 text-ios-blue ${enCours ? 'animate-spin' : ''}`} aria-hidden="true" style={{ transform: enCours ? undefined : `rotate(${progression * 270}deg)` }}>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(enCours ? 0.3 : progression) * 56.5} 56.5`} transform="rotate(-90 12 12)" />
          </svg>
        </div>
      </div>

      {/* Bulle « À jour » */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed left-1/2 z-40 -translate-x-1/2 transition-all duration-300 ${aJour ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
        style={{ top: 'calc(env(safe-area-inset-top) + 60px)' }}
      >
        {aJour && (
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold text-ios-label">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ios-green text-white text-[12px]">✓</span>
            À jour
          </div>
        )}
      </div>
    </>
  )
}
