import type { Carte, Categorie, Config } from './config'

/** Dépenses mensuelles saisies, en euros, par id de catégorie. */
export type Saisies = Record<string, number>

export type Mode = 'premiereAnnee' | 'croisiere'

export interface ResultatCarte {
  carte: Carte
  mode: Mode
  depenseAnnuelle: number
  milesDepenses: number
  milesBienvenue: number
  /** Bonus de bienvenue prévu par l'offre mais non atteint faute de dépenses. */
  bienvenueNonAtteinte: boolean
  milesTotal: number
  valeurBasse: number
  valeurHaute: number
  cotisation: number
  /** Cotisation annulée parce que les dépenses annuelles atteignent le seuil de gratuité. */
  cotisationOfferteParDepenses: boolean
  gainNetBas: number
  gainNetHaut: number
  gainNetMedian: number
  /**
   * Dépense mensuelle totale à partir de laquelle la valeur basse des miles
   * couvre la cotisation (hors bonus de bienvenue). null si pas de cotisation
   * ou si la carte ne rapporte rien.
   */
  pointMortMensuel: number | null
}

export interface Simulation {
  mode: Mode
  depenseMensuelleTotale: number
  resultats: ResultatCarte[]
  /** Carte au meilleur gain net médian. Peut être "aucune". */
  meilleure: ResultatCarte
}

/** Nettoie une saisie : vide, négatif ou non numérique → 0. */
export function nettoyer(valeur: unknown): number {
  const n = typeof valeur === 'number' ? valeur : Number(valeur)
  if (!Number.isFinite(n) || n < 0) return 0
  return n
}

export function saisiesParDefaut(categories: Categorie[]): Saisies {
  return Object.fromEntries(categories.map((c) => [c.id, nettoyer(c.defaut)]))
}

export function totalMensuel(saisies: Saisies, categories: Categorie[]): number {
  return categories.reduce((somme, c) => somme + nettoyer(saisies[c.id]), 0)
}

export function calculerCarte(
  carte: Carte,
  saisies: Saisies,
  config: Config,
  mode: Mode,
): ResultatCarte {
  const { categories, valeurMile } = config
  const mensuel = totalMensuel(saisies, categories)
  const depenseAnnuelle = mensuel * 12

  const milesDepenses = categories.reduce((somme, c) => {
    const taux = nettoyer(carte.taux[c.id])
    return somme + nettoyer(saisies[c.id]) * 12 * taux
  }, 0)

  let milesBienvenue = 0
  let bienvenueNonAtteinte = false
  if (mode === 'premiereAnnee' && carte.offre && carte.offre.milesBienvenue > 0) {
    const atteint = mensuel * carte.offre.conditionDelaiMois >= carte.offre.conditionDepense
    if (atteint) milesBienvenue = carte.offre.milesBienvenue
    else bienvenueNonAtteinte = true
  }

  const milesTotal = Math.floor(milesDepenses + milesBienvenue)
  const valeurBasse = milesTotal * valeurMile.basse
  const valeurHaute = milesTotal * valeurMile.haute

  const seuilGratuite = carte.cotisationOfferteDes ?? null
  const cotisationOfferteParDepenses =
    seuilGratuite !== null && seuilGratuite > 0 && depenseAnnuelle >= seuilGratuite
  const cotisationOffertePremiereAnnee = mode === 'premiereAnnee' && !!carte.offre?.premiereAnneeOfferte
  const cotisation =
    cotisationOffertePremiereAnnee || cotisationOfferteParDepenses ? 0 : carte.cotisationAnnuelle

  const gainNetBas = valeurBasse - cotisation
  const gainNetHaut = valeurHaute - cotisation
  const gainNetMedian = (gainNetBas + gainNetHaut) / 2

  // Point mort : on garde le mix de dépenses actuel et on cherche le facteur
  // d'échelle qui rend valeurBasse (hors bonus) égale à la cotisation pleine.
  let pointMortMensuel: number | null = null
  const valeurBasseHorsBonus = milesDepenses * valeurMile.basse
  if (carte.cotisationAnnuelle > 0 && valeurBasseHorsBonus > 0) {
    pointMortMensuel = (mensuel * carte.cotisationAnnuelle) / valeurBasseHorsBonus
    // Si la cotisation saute au-delà d'un seuil de dépenses, ce seuil est un point mort de fait.
    if (seuilGratuite !== null && seuilGratuite > 0) {
      pointMortMensuel = Math.min(pointMortMensuel, seuilGratuite / 12)
    }
  }

  return {
    carte,
    mode,
    depenseAnnuelle,
    milesDepenses: Math.floor(milesDepenses),
    milesBienvenue,
    bienvenueNonAtteinte,
    milesTotal,
    valeurBasse,
    valeurHaute,
    cotisation,
    cotisationOfferteParDepenses,
    gainNetBas,
    gainNetHaut,
    gainNetMedian,
    pointMortMensuel,
  }
}

export function simuler(saisies: Saisies, config: Config, mode: Mode): Simulation {
  const resultats = config.cartes.map((carte) => calculerCarte(carte, saisies, config, mode))
  // En cas d'égalité (toutes à 0 par exemple), la première carte du config gagne :
  // c'est "aucune carte", ce qui est le message honnête.
  const meilleure = resultats.reduce((best, r) => (r.gainNetMedian > best.gainNetMedian ? r : best))
  return {
    mode,
    depenseMensuelleTotale: totalMensuel(saisies, config.categories),
    resultats,
    meilleure,
  }
}

/** Nombre de mois de dépenses nécessaires pour atteindre un nombre de miles. */
export function moisPourAtteindre(milesCible: number, milesParAn: number): number | null {
  if (milesParAn <= 0) return null
  return Math.ceil((milesCible / milesParAn) * 12)
}

export interface SeuilRentabilite {
  carte: Carte
  /** Dépenses mensuelles (100 % en dépenses courantes) pour couvrir la cotisation avec la valeur basse du mile. */
  mensuelPrudent: number | null
  /** Idem avec la valeur haute du mile. */
  mensuelOptimiste: number | null
  /** true si le seuil retenu est le plafond de gratuité (ex. Silver dès 10 000 €/an). */
  plafonneParGratuite: boolean
}

/**
 * Dépenses mensuelles à partir desquelles une carte est rentable en régime de
 * croisière, en supposant des dépenses 100 % « courantes » (le barème le plus
 * faible, donc l'estimation la plus prudente).
 */
export function seuilRentabilite(carte: Carte, config: Config, categorieCourante = 'courant'): SeuilRentabilite {
  const taux = nettoyer(carte.taux[categorieCourante])
  const seuilGratuite = carte.cotisationOfferteDes ?? null
  const mensuelGratuite = seuilGratuite !== null && seuilGratuite > 0 ? seuilGratuite / 12 : null

  const pour = (valeur: number): number | null => {
    if (carte.cotisationAnnuelle <= 0) return 0
    if (taux <= 0 || valeur <= 0) return mensuelGratuite
    const brut = carte.cotisationAnnuelle / (12 * taux * valeur)
    return mensuelGratuite !== null ? Math.min(brut, mensuelGratuite) : brut
  }

  const mensuelPrudent = pour(config.valeurMile.basse)
  const plafonneParGratuite =
    mensuelGratuite !== null && mensuelPrudent !== null && Math.abs(mensuelPrudent - mensuelGratuite) < 1e-9
  return { carte, mensuelPrudent, mensuelOptimiste: pour(config.valeurMile.haute), plafonneParGratuite }
}

export interface PalierParrainage {
  /** Nombre de filleuls parrainés (0 = bonus de bienvenue seul). */
  filleuls: number
  milesTotal: number
}

/**
 * Miles cumulés avec le bonus de bienvenue puis 1, 2, 3… filleuls.
 * Si le gain par filleul est inconnu (null), seul le palier 0 est renvoyé.
 */
export function paliersParrainage(carte: Carte, maxFilleuls = 3): PalierParrainage[] {
  const bienvenue = carte.offre?.milesBienvenue ?? 0
  const parFilleul = carte.parrainage?.milesParFilleul ?? null
  const paliers: PalierParrainage[] = [{ filleuls: 0, milesTotal: bienvenue }]
  if (parFilleul === null || parFilleul <= 0) return paliers
  for (let n = 1; n <= maxFilleuls; n++) {
    paliers.push({ filleuls: n, milesTotal: bienvenue + n * parFilleul })
  }
  return paliers
}
