import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, type Location } from 'react-router-dom'
import { config } from '../../lib/config'
import { sensEntre, type Sens } from '../../lib/pages'
import { defilementDe, memoriserDefilement } from '../../lib/defilement'
import type { EtatSimulation } from '../simulateur/useSimulation'
import { useGlissement, type Glisse } from './useGlissement'
import PageAccueil from '../../pages/PageAccueil'
import PageSimulateur from '../../pages/PageSimulateur'
import PageOffre from '../../pages/PageOffre'
import PageComparatif from '../../pages/PageComparatif'
import PageInscription from '../../pages/PageInscription'
import PageFaq from '../../pages/PageFaq'
import PageValeur from '../../pages/PageValeur'
import PagePartenaires from '../../pages/PagePartenaires'
import PageApp from '../../pages/PageApp'

function Pages({ sim, location }: { sim: EtatSimulation; location: Location | string }) {
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
 * Scène des pages :
 * - au changement de page (onglet, lien), transition à la manière d'iOS : l'ancienne page reste
 *   rendue en absolu et s'écarte pendant que la nouvelle glisse, dans le sens du menu ;
 * - sur mobile, un balayage horizontal fait suivre les deux pages au doigt, comme entre deux
 *   bureaux sur un Mac, puis termine ou annule au relâchement ;
 * - chaque page est retrouvée à la position de défilement où on l'avait laissée.
 */
export default function Scene({ sim }: { sim: EtatSimulation }) {
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
    document.documentElement.style.removeProperty('--balayage-progression')
    if (scene.courante.hash) return // vers une ancre : ScrollManager s'en charge
    const max = document.documentElement.scrollHeight - window.innerHeight
    const cible = Math.max(0, Math.min(defilementDe(scene.courante.pathname), max))
    window.scrollTo({ top: cible, behavior: 'instant' })
    if (sortanteRef.current) sortanteRef.current.style.top = `${cible - scene.ancienDefilement}px`
  }, [scene.courante.pathname, scene.courante.hash, scene.ancienDefilement])

  const finTransition = () => setScene((s) => (s.sortante ? { ...s, sortante: null } : s))

  useGlissement({ sceneRef, piste, pathnameRef, navigateRef, glisseRef, setGlisse })

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
        {glisse?.voisines.map((v) => (
          <div key={v.to} className="page-voisine" style={{ top: glisse.haut, height: glisse.hauteur, left: `${v.decalage * 100}%` }} aria-hidden="true" inert>
            <div style={{ transform: `translateY(${-v.defilement}px)` }}>
              <Pages sim={sim} location={v.to} />
            </div>
          </div>
        ))}
      </div>
      {scene.sortante && (
        <div ref={sortanteRef} className="page-sortante" style={{ top: -scene.ancienDefilement }} aria-hidden="true" inert>
          <Pages sim={sim} location={scene.sortante} />
        </div>
      )}
    </main>
  )
}

