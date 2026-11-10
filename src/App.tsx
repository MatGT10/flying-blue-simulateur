import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, type Location } from 'react-router-dom'
import { config } from './lib/config'
import { pages } from './lib/pages'
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

function Pages({ sim, location }: { sim: ReturnType<typeof useSimulation>; location: Location }) {
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
  decalage: number // défilement de la page sortante, pour qu'elle ne saute pas en haut pendant la sortie
}

/**
 * Transition entre pages à la manière d'iOS : l'ancienne page glisse dehors pendant que la
 * nouvelle entre, dans le sens du menu (ou du balayage). La page sortante reste rendue le
 * temps de l'animation, en position absolue, décalée de son ancien défilement.
 */
function Contenu({ sim }: { sim: ReturnType<typeof useSimulation> }) {
  const location = useLocation()
  const [scene, setScene] = useState<Scene>({ courante: location, sortante: null, sens: 'fondu', decalage: 0 })

  // L'état dérive de l'adresse pendant le rendu : pas d'image intermédiaire avec l'ancienne page seule.
  if (location.pathname !== scene.courante.pathname) {
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setScene({
      courante: location,
      sortante: reduit ? null : scene.courante,
      sens: sensEntre(scene.courante.pathname, location.pathname),
      decalage: window.scrollY,
    })
  } else if (location.key !== scene.courante.key) {
    // Même page, ancre différente : pas d'animation.
    setScene({ ...scene, courante: location })
  }

  const finTransition = () => setScene((s) => (s.sortante ? { ...s, sortante: null } : s))

  return (
    <main className="scene flex-1" data-transition={scene.sortante ? scene.sens : undefined}>
      <div className={scene.sortante ? 'page-entrante' : undefined} onAnimationEnd={finTransition}>
        <Pages sim={sim} location={scene.courante} />
      </div>
      {scene.sortante && (
        <div className="page-sortante" style={{ top: -scene.decalage }} aria-hidden="true" inert>
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
