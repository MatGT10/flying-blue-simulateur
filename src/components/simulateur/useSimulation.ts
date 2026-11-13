import { useEffect, useMemo, useState } from 'react'
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
  /** Charge des montants et une période (lien partagé ou exemple ouvert depuis le site). */
  charger: (etat: { brutes?: SaisiesBrutes; mode?: Mode }) => void
}

const CLE = 'fb-simulation'

/** Dernière simulation enregistrée sur l'appareil (montants et période), si elle est bien formée. */
function lireSauvegarde(config: Config): { brutes: SaisiesBrutes; mode?: Mode } {
  try {
    const v = localStorage.getItem(CLE)
    if (!v) return { brutes: {} }
    const o = JSON.parse(v) as { brutes?: Record<string, unknown>; mode?: unknown }
    const brutes: SaisiesBrutes = {}
    for (const c of config.categories) {
      const x = o.brutes?.[c.id]
      if (typeof x === 'string') brutes[c.id] = x
    }
    const mode = o.mode === 'premiereAnnee' || o.mode === 'croisiere' ? o.mode : undefined
    return { brutes, mode }
  } catch {
    return { brutes: {} }
  }
}

export function useSimulation(config: Config): EtatSimulation {
  const [initial] = useState(() => {
    const defauts = Object.fromEntries(config.categories.map((c) => [c.id, String(c.defaut)]))
    if (typeof window === 'undefined') return { brutes: defauts, mode: 'premiereAnnee' as Mode }
    // Priorité : lien partagé, puis dernière saisie sur cet appareil, puis valeurs par défaut.
    const sauvegarde = lireSauvegarde(config)
    const depuisUrl = lireEtatDepuisUrl(config.categories)
    return {
      brutes: { ...defauts, ...sauvegarde.brutes, ...(depuisUrl.brutes ?? {}) },
      mode: depuisUrl.mode ?? sauvegarde.mode ?? ('premiereAnnee' as Mode),
    }
  })
  const [brutes, setBrutes] = useState<SaisiesBrutes>(initial.brutes)
  const [mode, setMode] = useState<Mode>(initial.mode)

  // Les montants saisis restent sur l'appareil : on les retrouve à la prochaine ouverture.
  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify({ brutes, mode }))
    } catch {
      // stockage indisponible : rien à enregistrer
    }
  }, [brutes, mode])

  const simulation = useMemo(() => {
    const saisies: Saisies = Object.fromEntries(
      config.categories.map((c) => [c.id, nettoyer(brutes[c.id])]),
    )
    return simuler(saisies, config, mode)
  }, [brutes, config, mode])

  const setChamp = (id: string, valeur: string) => setBrutes((prev) => ({ ...prev, [id]: valeur }))
  const charger = (etat: { brutes?: SaisiesBrutes; mode?: Mode }) => {
    if (etat.brutes) setBrutes((prev) => ({ ...prev, ...etat.brutes }))
    if (etat.mode) setMode(etat.mode)
  }

  return { brutes, setChamp, mode, setMode, simulation, charger }
}
