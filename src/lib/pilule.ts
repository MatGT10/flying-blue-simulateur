/**
 * Liaison entre la pilule d'onglets (Nav) et la scène des pages (App) quand on déplace la bulle
 * au doigt : la pilule annonce le geste, la scène fait coulisser les pages en conséquence.
 */
export type EvenementPilule =
  | { phase: 'debut' }
  | { phase: 'mouvement'; position: number } // colonne fractionnaire de la bulle (0 à 4)
  | { phase: 'fin'; colonne: number } // colonne d'arrivée (0 à 3 : une page)
  | { phase: 'annule' } // retour en place (relâché sur « Plus », ou geste interrompu)

const NOM = 'fb-pilule'

export function annoncerPilule(e: EvenementPilule): void {
  window.dispatchEvent(new CustomEvent<EvenementPilule>(NOM, { detail: e }))
}

export function ecouterPilule(f: (e: EvenementPilule) => void): () => void {
  const h = (ev: Event) => f((ev as CustomEvent<EvenementPilule>).detail)
  window.addEventListener(NOM, h)
  return () => window.removeEventListener(NOM, h)
}
