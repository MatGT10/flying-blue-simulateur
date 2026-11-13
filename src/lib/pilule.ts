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

/**
 * Cible de la bulle d'onglet (colonne, fractionnaire pendant un geste). La bulle la rejoint avec
 * une physique de ressort, calculée par la barre d'onglets ; la scène la vise pendant un balayage.
 * Mode « suivi » : le doigt la guide (ressort ferme) ; « libre » : elle se pose d'elle-même (léger dépassement).
 */
export type ModeBulle = 'suivi' | 'libre'
type EcouteurBulle = (cible: number, mode: ModeBulle) => void
const ecouteurs = new Set<EcouteurBulle>()
let cibleCourante = 0
let modeCourant: ModeBulle = 'libre'

export function viserBulle(cible: number, mode: ModeBulle): void {
  cibleCourante = cible
  modeCourant = mode
  ecouteurs.forEach((f) => f(cible, mode))
}

export function ecouterBulle(f: EcouteurBulle): () => void {
  ecouteurs.add(f)
  f(cibleCourante, modeCourant)
  return () => {
    ecouteurs.delete(f)
  }
}
