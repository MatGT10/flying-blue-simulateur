import type { Config } from '../lib/config'
import type { EtatSimulation } from '../components/simulateur/useSimulation'
import Hero from '../components/Hero'
import Simulateur from '../components/simulateur/Simulateur'

export default function PageSimulateur({ config, sim }: { config: Config; sim: EtatSimulation }) {
  return (
    <>
      <Hero config={config} />
      <Simulateur config={config} sim={sim} />
    </>
  )
}
