import { BrowserRouter } from 'react-router-dom'
import { config } from './lib/config'
import { useSimulation } from './components/simulateur/useSimulation'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ScrollManager from './components/ScrollManager'
import Gestes from './components/Gestes'
import Scene from './components/scene/Scene'

export default function App() {
  // L'état du simulateur vit ici pour survivre aux changements de page.
  const sim = useSimulation(config)

  return (
    <BrowserRouter>
      <ScrollManager />
      <Gestes />
      <div className="min-h-dvh flex flex-col">
        <Nav />
        <Scene sim={sim} />
        <Footer config={config} />
      </div>
    </BrowserRouter>
  )
}
