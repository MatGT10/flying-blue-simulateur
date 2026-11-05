import { useMemo, useState } from 'react'
import type { Config } from '../../lib/config'
import { nettoyer, simuler, type Mode, type Saisies, type Simulation } from '../../lib/calcul'

/** Valeurs brutes des champs (chaînes, pour autoriser un champ vidé). */
export type SaisiesBrutes = Record<string, string>

export interface EtatSimulation {
  brutes: SaisiesBrutes
  setChamp: (id: string, valeur: string) => void
  mode: Mode
  setMode: (m: Mode) => void
  simulation: Simulation
}

export function useSimulation(config: Config): EtatSimulation {
  const [brutes, setBrutes] = useState<SaisiesBrutes>(() =>
    Object.fromEntries(config.categories.map((c) => [c.id, String(c.defaut)])),
  )
  const [mode, setMode] = useState<Mode>('croisiere')

  const simulation = useMemo(() => {
    const saisies: Saisies = Object.fromEntries(
      config.categories.map((c) => [c.id, nettoyer(brutes[c.id])]),
    )
    return simuler(saisies, config, mode)
  }, [brutes, config, mode])

  const setChamp = (id: string, valeur: string) => setBrutes((prev) => ({ ...prev, [id]: valeur }))

  return { brutes, setChamp, mode, setMode, simulation }
}
