import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, type Location } from 'react-router-dom'
import { config } from './lib/config'
import { pages } from './lib/pages'
import { defilementDe, memoriserDefilement } from './lib/defilement'
import { libererVerrou, prendreVerrou } from './lib/verrouGeste'
import { useSimulation } from './components/simulateur/useSimulation'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ScrollManager from './components/ScrollManager'
import Gestes from './components/Gestes'
import PageAccueil from './pages/PageAccueil'
import PageSimulateur from './pages/PageSimulateur'
import PageOffre from './pages/PageOffre'
import PageComparatif from './pages/PageComparatif'
import PageInscription from './pages/PageInscription'
import PageFaq from './pages/PageFaq'
import PageValeur from './pages/PageValeur'
import PagePartenaires from './pages/PagePartenaires'
import PageApp from './pages/PageApp'

type Sens = 'gauche' | 'droite' | 'fondu'

/** Vers une page plus loin dans le menu : la nouvelle arrive par la droite ; plus tôt : par la gauche. */
function sensEntre(de: string, vers: string): Sens {
  const i = pages.findIndex((p) => p.to === de)
  const j = pages.findIndex((p) => p.to === vers)
  if (i < 0 || j < 0 || i === j) return 'fondu'
  return j > i ? 'gauche' : 'droite'
}

function Pages({ sim, location }: { sim: ReturnType<typeof useSimulation>; location: Location | string }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<PageAccueil config={config} />} />
      <Route path="/simulateur" element={<PageSimulateur config={config} sim={sim} />} />
      <Route path="/valeur" element={<PageValeur config={config} />} />
      <Route path="/offre" element={<PageOffre config={config} />} />
      <Route path="/partenaires" element={<PagePartenaires config={config} />} />
      <Route path="/comparatif" element={<PageComparatif config={config} />} />
      <Route path="/inscription" element={<PageInscription config={config} />} />
      <Route path="/faq" element={<PageFaq config={config} />} />
      <Route path="/app" element={<PageApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

interface Scene {
  courante: Location
  sortante: Location | null
  sens: Sens
  ancienDefilement: number // défilement de la page quittée, pour positionner la page sortante
}

/** Balayage en cours : la page voisine est rendue à côté de la page courante et les deux suivent le doigt. */
interface Glisse {
  voisine: string
  sens: 'gauche' | 'droite'
  haut: number // position de la fenêtre visible, dans la scène
  hauteur: number // hauteur visible sous la barre du haut
  defilementVoisine: number
  termine: boolean // le balayage est allé au bout : la navigation qui suit se fait sans animation
}

const MOBILE = 640 // px : en dessous, le balayage entre pages est actif
const MARGE = 10 // px de mouvement avant de décider si le geste est un balayage
const COURBE = 'cubic-bezier(0.32, 0.72, 0, 1)'

/**
 * Scène des pages :
 * - au changement de page (onglet, lien), transition à la manière d'iOS : l'ancienne page reste
 *   rendue en absolu et s'écarte pendant que la nouvelle glisse, dans le sens du menu ;
 * - sur mobile, un balayage horizontal fait suivre les deux pages au doigt, comme entre deux
 *   bureaux sur un Mac, puis termine ou annule au relâchement ;
 * - chaque page est retrouvée à la position de défilement où on l'avait laissée.
 */
function Contenu({ sim }: { sim: ReturnType<typeof useSimulation> }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [scene, setScene] = useState<Scene>({ courante: location, sortante: null, sens: 'fondu', ancienDefilement: 0 })
  const [glisse, setGlisse] = useState<Glisse | null>(null)
  const sceneRef = useRef<HTMLElement>(null)
  const piste = useRef<HTMLDivElement>(null)
  const sortanteRef = useRef<HTMLDivElement>(null)
  const navigateRef = useRef(navigate)
  const pathnameRef = useRef(location.pathname)
  const glisseRef = useRef<Glisse | null>(null)
  useEffect(() => {
    navigateRef.current = navigate
    pathnameRef.current = location.pathname
    glisseRef.current = glisse
  })

  // L'état dérive de l'adresse pendant le rendu : pas d'image intermédiaire avec l'ancienne page seule.
  if (location.pathname !== scene.courante.pathname) {
    memoriserDefilement(scene.courante.pathname, window.scrollY)
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const instant = glisse?.termine === true
    setScene({
      courante: location,
      sortante: reduit || instant ? null : scene.courante,
      sens: sensEntre(scene.courante.pathname, location.pathname),
      ancienDefilement: window.scrollY,
    })
    if (instant) setGlisse(null)
  } else if (location.key !== scene.courante.key) {
    // Même page, ancre différente : pas d'animation.
    setScene({ ...scene, courante: location })
  }

  // Avant le premier affichage de la nouvelle page : défilement retrouvé, page sortante calée,
  // piste remise en place (fin d'un balayage).
  useLayoutEffect(() => {
    const p = piste.current
    if (p) {
      p.style.transition = ''
      p.style.transform = ''
    }
    if (scene.courante.hash) return // vers une ancre : ScrollManager s'en charge
    const max = document.documentElement.scrollHeight - window.innerHeight
    const cible = Math.max(0, Math.min(defilementDe(scene.courante.pathname), max))
    window.scrollTo({ top: cible, behavior: 'instant' })
    if (sortanteRef.current) sortanteRef.current.style.top = `${cible - scene.ancienDefilement}px`
  }, [scene.courante.pathname, scene.courante.hash, scene.ancienDefilement])

  const finTransition = () => setScene((s) => (s.sortante ? { ...s, sortante: null } : s))

  // Balayage horizontal suivi au doigt (mobile).
  useEffect(() => {
    const g: { d: { x: number; y: number; t: number; decide: boolean; actif: boolean; sens: 'gauche' | 'droite'; voisine: string } | null } = { d: null }

    const borner = (dx: number, sens: 'gauche' | 'droite') => (sens === 'gauche' ? Math.min(0, dx) : Math.max(0, dx))

    const terminer = (valide: boolean, sens: 'gauche' | 'droite', voisine: string) => {
      const p = piste.current
      if (!p) return
      p.style.transition = `transform 280ms ${COURBE}`
      p.style.transform = valide ? `translateX(${sens === 'gauche' ? '-100%' : '100%'})` : 'translateX(0)'
      let fini = false
      const fin = () => {
        if (fini) return
        fini = true
        p.removeEventListener('transitionend', fin)
        if (valide) {
          // La piste reste décalée jusqu'au rendu de la nouvelle page (remise à zéro dans le layout effect).
          setGlisse((g) => (g ? { ...g, termine: true } : g))
          navigateRef.current(voisine)
        } else {
          p.style.transition = ''
          p.style.transform = ''
          setGlisse(null)
        }
      }
      p.addEventListener('transitionend', fin)
      window.setTimeout(fin, 340)
    }

    const onMove = (e: TouchEvent) => {
      const d = g.d
      if (!d) return
      const t = e.touches[0]
      const dx = t.clientX - d.x
      const dy = t.clientY - d.y
      if (!d.decide) {
        if (Math.abs(dx) < MARGE && Math.abs(dy) < MARGE) return
        d.decide = true
        // Franchement horizontal, et le navigateur n'a pas déjà pris le geste pour défiler.
        if (Math.abs(dx) < Math.abs(dy) * 1.2 || !e.cancelable || !prendreVerrou('balayage')) {
          g.d = null
          return
        }
        const i = pages.findIndex((p) => p.to === pathnameRef.current)
        const voisine = i < 0 ? undefined : dx < 0 ? pages[i + 1] : pages[i - 1]
        if (!voisine) {
          libererVerrou('balayage')
          g.d = null
          return
        }
        d.actif = true
        d.sens = dx < 0 ? 'gauche' : 'droite'
        d.voisine = voisine.to
        const entete = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        const haut = entete - (sceneRef.current?.getBoundingClientRect().top ?? 0)
        setGlisse({ voisine: voisine.to, sens: d.sens, haut, hauteur: window.innerHeight - entete, defilementVoisine: defilementDe(voisine.to), termine: false })
      }
      if (!d.actif) return
      if (e.cancelable) e.preventDefault()
      const p = piste.current
      if (p) {
        p.style.transition = 'none'
        p.style.transform = `translateX(${borner(dx, d.sens)}px)`
      }
    }
    const retirerMove = () => window.removeEventListener('touchmove', onMove)

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || window.innerWidth >= MOBILE || glisseRef.current) return
      const cible = e.target instanceof Element ? e.target : null
      if (cible?.closest('[data-sans-geste], [role="dialog"], input, textarea, select, button, a')) return
      const t = e.touches[0]
      g.d = { x: t.clientX, y: t.clientY, t: Date.now(), decide: false, actif: false, sens: 'gauche', voisine: '' }
      window.addEventListener('touchmove', onMove, { passive: false })
    }

    const onEnd = (e: TouchEvent) => {
      retirerMove()
      const dd = g.d
      g.d = null
      if (!dd) return
      libererVerrou('balayage')
      if (!dd.actif) return
      const t = e.changedTouches[0]
      const dx = borner(t.clientX - dd.x, dd.sens)
      const vitesse = Math.abs(dx) / Math.max(1, Date.now() - dd.t) // px par ms
      const valide = Math.abs(dx) > window.innerWidth * 0.3 || (vitesse > 0.45 && Math.abs(dx) > 30)
      terminer(valide, dd.sens, dd.voisine)
    }
    const onCancel = () => {
      retirerMove()
      const dd = g.d
      g.d = null
      libererVerrou('balayage')
      if (dd?.actif) terminer(false, dd.sens, dd.voisine)
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
    <main
      ref={sceneRef}
      className={`scene flex-1 ${glisse ? 'scene-glisse' : ''}`}
      data-transition={scene.sortante ? scene.sens : undefined}
    >
      <div ref={piste} className="piste">
        <div className={scene.sortante ? 'page-entrante' : undefined} onAnimationEnd={finTransition}>
          <Pages sim={sim} location={scene.courante} />
        </div>
        {glisse && (
          <div
            className="page-voisine"
            style={{ top: glisse.haut, height: glisse.hauteur, left: glisse.sens === 'gauche' ? '100%' : '-100%' }}
            aria-hidden="true"
            inert
          >
            <div style={{ transform: `translateY(${-glisse.defilementVoisine}px)` }}>
              <Pages sim={sim} location={glisse.voisine} />
            </div>
          </div>
        )}
      </div>
      {scene.sortante && (
        <div ref={sortanteRef} className="page-sortante" style={{ top: -scene.ancienDefilement }} aria-hidden="true" inert>
          <Pages sim={sim} location={scene.sortante} />
        </div>
      )}
    </main>
  )
}

export default function App() {
  // L'état du simulateur vit ici pour survivre aux changements de page.
  const sim = useSimulation(config)

  return (
    <BrowserRouter>
      <ScrollManager />
      <Gestes />
      <div className="min-h-dvh flex flex-col">
        <Nav />
        <Contenu sim={sim} />
        <Footer config={config} />
      </div>
    </BrowserRouter>
  )
}
