import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, type Location } from 'react-router-dom'
import { config } from './lib/config'
import { colonneOnglet, pagesMenu, sensEntre, type Sens } from './lib/pages'
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

/**
 * Balayage en cours : les pages voisines (avant et après) sont rendues de part et d'autre de la
 * page courante, et tout suit le doigt. La direction n'est décidée qu'au relâchement, on peut
 * donc changer d'avis sans lever le doigt.
 */
interface Glisse {
  precedente: string | null
  suivante: string | null
  haut: number // position de la fenêtre visible, dans la scène
  hauteur: number // hauteur visible sous la barre du haut
  defilementPrecedente: number
  defilementSuivante: number
  termine: boolean // le balayage est allé au bout : la navigation qui suit se fait sans animation
}

const MOBILE = 640 // px : en dessous, le balayage entre pages est actif
const MARGE = 8 // px de mouvement avant de décider si le geste est un balayage
const SEUIL_SECOURS = 70 // px : balayage jugé à la fin du geste quand le suivi au doigt n'a pas pu démarrer
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
    document.documentElement.classList.remove('balayage', 'balayage-fin')
    document.documentElement.style.removeProperty('--onglet-glisse')
    document.documentElement.style.removeProperty('--balayage-progression')
    if (scene.courante.hash) return // vers une ancre : ScrollManager s'en charge
    const max = document.documentElement.scrollHeight - window.innerHeight
    const cible = Math.max(0, Math.min(defilementDe(scene.courante.pathname), max))
    window.scrollTo({ top: cible, behavior: 'instant' })
    if (sortanteRef.current) sortanteRef.current.style.top = `${cible - scene.ancienDefilement}px`
  }, [scene.courante.pathname, scene.courante.hash, scene.ancienDefilement])

  const finTransition = () => setScene((s) => (s.sortante ? { ...s, sortante: null } : s))

  // Balayage horizontal suivi au doigt (mobile).
  useEffect(() => {
    const g: { d: { x: number; y: number; t: number; decide: boolean; actif: boolean; precedente: string | null; suivante: string | null } | null } = { d: null }
    const racine = document.documentElement

    const deplacer = (p: HTMLDivElement, dx: number) => {
      p.style.transform = `translate3d(${dx}px, 0, 0)`
    }
    /** Déplacement effectif : sans page de ce côté, le doigt tire avec résistance (rebond iOS). */
    const effectif = (dx: number, prec: string | null, suiv: string | null) => {
      if (dx < 0 && !suiv) return dx * 0.28
      if (dx > 0 && !prec) return dx * 0.28
      return dx
    }
    /** Colonne fractionnaire de la bulle d'onglet pendant le geste. */
    const colonneGlisse = (dx: number, prec: string | null, suiv: string | null) => {
      const de = colonneOnglet(pathnameRef.current)
      const cible = dx < 0 ? suiv : prec
      if (de < 0 || !cible) return de
      const vers = colonneOnglet(cible)
      if (vers < 0) return de
      return de + (vers - de) * Math.min(1, Math.abs(dx) / window.innerWidth)
    }
    const finBulle = () => {
      racine.classList.remove('balayage', 'balayage-fin')
      racine.style.removeProperty('--onglet-glisse')
      racine.style.removeProperty('--balayage-progression')
    }

    const terminer = (dx: number, prec: string | null, suiv: string | null, vitesse: number) => {
      const p = piste.current
      if (!p) return
      const voisine = dx < 0 ? suiv : prec
      const valide = !!voisine && (Math.abs(dx) > window.innerWidth * 0.3 || (vitesse > 0.45 && Math.abs(dx) > 30))
      p.style.transition = `transform 280ms ${COURBE}`
      p.style.transform = valide ? `translate3d(${dx < 0 ? '-100%' : '100%'}, 0, 0)` : 'translate3d(0, 0, 0)'
      // La bulle d'onglet rejoint sa colonne d'arrivée en même temps que la page.
      racine.classList.add('balayage-fin')
      const colonneArrivee = valide && voisine ? colonneOnglet(voisine) : colonneOnglet(pathnameRef.current)
      if (colonneArrivee >= 0) racine.style.setProperty('--onglet-glisse', String(colonneArrivee))
      racine.style.setProperty('--balayage-progression', valide ? (dx < 0 ? '-1' : '1') : '0')
      let fini = false
      const fin = () => {
        if (fini) return
        fini = true
        p.removeEventListener('transitionend', fin)
        if (valide && voisine) {
          // La piste et la bulle restent en place jusqu'au rendu de la nouvelle page (layout effect).
          setGlisse((g) => (g ? { ...g, termine: true } : g))
          navigateRef.current(voisine)
        } else {
          p.style.transition = ''
          p.style.transform = ''
          finBulle()
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
        // Suivi au doigt dès que le geste part plus à l'horizontale qu'à la verticale. On ne se fie pas
        // à e.cancelable : WebKit le met à faux quand touch-action interdit le défilement horizontal,
        // ce qui est justement notre cas. Sinon, le geste reste jugé à la fin (voir onEnd).
        if (Math.abs(dx) <= Math.abs(dy) || !prendreVerrou('balayage')) return
        const i = pagesMenu.findIndex((p) => p.to === pathnameRef.current)
        if (i < 0) {
          libererVerrou('balayage')
          return
        }
        d.actif = true
        d.precedente = pagesMenu[i - 1]?.to ?? null
        d.suivante = pagesMenu[i + 1]?.to ?? null
        const entete = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        const haut = entete - (sceneRef.current?.getBoundingClientRect().top ?? 0)
        setGlisse({
          precedente: d.precedente,
          suivante: d.suivante,
          haut,
          hauteur: window.innerHeight - entete,
          defilementPrecedente: d.precedente ? defilementDe(d.precedente) : 0,
          defilementSuivante: d.suivante ? defilementDe(d.suivante) : 0,
          termine: false,
        })
        racine.classList.add('balayage')
      }
      if (!d.actif) return
      if (e.cancelable) e.preventDefault()
      const p = piste.current
      if (p) {
        p.style.transition = 'none'
        deplacer(p, effectif(dx, d.precedente, d.suivante))
      }
      racine.style.setProperty('--onglet-glisse', String(colonneGlisse(dx, d.precedente, d.suivante)))
      racine.style.setProperty('--balayage-progression', String(effectif(dx, d.precedente, d.suivante) / window.innerWidth))
    }
    const retirerMove = () => window.removeEventListener('touchmove', onMove)

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || window.innerWidth >= MOBILE || glisseRef.current) return
      const cible = e.target instanceof Element ? e.target : null
      if (cible?.closest('[data-sans-geste], [role="dialog"], input, textarea, select, button, a')) return
      const t = e.touches[0]
      g.d = { x: t.clientX, y: t.clientY, t: Date.now(), decide: false, actif: false, precedente: null, suivante: null }
      window.addEventListener('touchmove', onMove, { passive: false })
    }

    const onEnd = (e: TouchEvent) => {
      retirerMove()
      const dd = g.d
      g.d = null
      if (!dd) return
      libererVerrou('balayage')
      const t = e.changedTouches[0]
      const dx = t.clientX - dd.x
      if (!dd.actif) {
        // Secours : le suivi au doigt n'a pas démarré (geste parti en biais), mais le geste entier
        // est un balayage net → changement de page animé.
        const dy = t.clientY - dd.y
        if (Math.abs(dx) >= SEUIL_SECOURS && Math.abs(dy) < Math.abs(dx) / 2 && Date.now() - dd.t < 600) {
          const i = pagesMenu.findIndex((p) => p.to === pathnameRef.current)
          const voisine = i < 0 ? undefined : dx < 0 ? pagesMenu[i + 1] : pagesMenu[i - 1]
          if (voisine) navigateRef.current(voisine.to)
        }
        return
      }
      const vitesse = Math.abs(dx) / Math.max(1, Date.now() - dd.t) // px par ms
      terminer(dx, dd.precedente, dd.suivante, vitesse)
    }
    const onCancel = () => {
      retirerMove()
      const dd = g.d
      g.d = null
      libererVerrou('balayage')
      if (dd?.actif) terminer(0, dd.precedente, dd.suivante, 0)
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    window.addEventListener('touchcancel', onCancel, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onCancel)
      retirerMove()
      finBulle()
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
        {glisse?.precedente && (
          <div className="page-voisine" style={{ top: glisse.haut, height: glisse.hauteur, left: '-100%' }} aria-hidden="true" inert>
            <div style={{ transform: `translateY(${-glisse.defilementPrecedente}px)` }}>
              <Pages sim={sim} location={glisse.precedente} />
            </div>
          </div>
        )}
        {glisse?.suivante && (
          <div className="page-voisine" style={{ top: glisse.haut, height: glisse.hauteur, left: '100%' }} aria-hidden="true" inert>
            <div style={{ transform: `translateY(${-glisse.defilementSuivante}px)` }}>
              <Pages sim={sim} location={glisse.suivante} />
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
