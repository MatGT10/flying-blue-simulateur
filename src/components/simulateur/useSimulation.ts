import { useMemo, useState } from 'react'
import type { Config } from '../../lib/config'
import { nettoyer, simuler, type Mode, type Saisies, type Simulation } from '../../lib/calcul'
import { lireEtatDepuisUrl } from '../../lib/partage'

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
  const [initial] = useState(() => {
    const defauts = Object.fromEntries(config.categories.map((c) => [c.id, String(c.defaut)]))
    const depuisUrl = typeof window === 'undefined' ? {} : lireEtatDepuisUrl(config.categories)
    return {
      brutes: { ...defauts, ...(depuisUrl.brutes ?? {}) },
      mode: depuisUrl.mode ?? ('croisiere' as Mode),
    }
  })
  const [brutes, setBrutes] = useState<SaisiesBrutes>(initial.brutes)
  const [mode, setMode] = useState<Mode>(initial.mode)

  const simulation = useMemo(() => {
    const saisies: Saisies = Object.fromEntries(
      config.categories.map((c) => [c.id, nettoyer(brutes[c.id])]),
    )
    return simuler(saisies, config, mode)
  }, [brutes, config, mode])

  const setChamp = (id: string, valeur: string) => setBrutes((prev) => ({ ...prev, [id]: valeur }))

  return { brutes, setChamp, mode, setMode, simulation }
}
