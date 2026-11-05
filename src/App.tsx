import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { config } from './lib/config'
import { useSimulation } from './components/simulateur/useSimulation'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ScrollManager from './components/ScrollManager'
import PageAccueil from './pages/PageAccueil'
import PageOffre from './pages/PageOffre'
import PageComparatif from './pages/PageComparatif'
import PageFaq from './pages/PageFaq'

export default function App() {
  // L'état du simulateur vit ici pour survivre aux changements de page.
  const sim = useSimulation(config)

  return (
    <BrowserRouter>
      <ScrollManager />
      <div className="min-h-dvh flex flex-col">
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<PageAccueil config={config} sim={sim} />} />
            <Route path="/offre" element={<PageOffre config={config} />} />
            <Route path="/comparatif" element={<PageComparatif config={config} />} />
            <Route path="/faq" element={<PageFaq config={config} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer config={config} />
      </div>
    </BrowserRouter>
  )
}
