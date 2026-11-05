import { config } from './lib/config'
import { useSimulation } from './components/simulateur/useSimulation'
import Hero from './components/Hero'
import Simulateur from './components/simulateur/Simulateur'
import Offre from './components/Offre'
import Parrainage from './components/Parrainage'
import Rentabilite from './components/Rentabilite'
import Exemples from './components/Exemples'
import Avantages from './components/Avantages'
import FAQ from './components/FAQ'
import Transparence from './components/Transparence'
import Footer from './components/Footer'

export default function App() {
  const sim = useSimulation(config)

  return (
    <div className="min-h-dvh flex flex-col">
      <Hero config={config} />
      <main className="flex-1">
        <Simulateur config={config} sim={sim} />
        <Offre config={config} />
        <Parrainage config={config} />
        <Rentabilite config={config} />
        <Exemples config={config} simulation={sim.simulation} />
        <Avantages config={config} />
        <FAQ config={config} />
        <Transparence config={config} />
      </main>
      <Footer config={config} />
    </div>
  )
}
