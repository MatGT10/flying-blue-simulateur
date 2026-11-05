import brut from '../data/config.json'

/** Identifiant d'une catégorie de dépense (clé de `taux` sur chaque carte). */
export type CategorieId = string

export interface Categorie {
  id: CategorieId
  label: string
  aide: string
  /** Valeur mensuelle pré-remplie, en euros. */
  defaut: number
}

export interface OffreCarte {
  premiereAnneeOfferte: boolean
  milesBienvenue: number
  /** Dépenses à atteindre en `conditionDelaiMois` mois pour toucher le bonus. */
  conditionDepense: number
  conditionDelaiMois: number
}

export type Accent = 'neutre' | 'argent' | 'or' | 'platine'

export interface Carte {
  id: string
  nom: string
  courte: string
  description: string
  cotisationAnnuelle: number
  /** Dépenses annuelles à partir desquelles la cotisation est offerte (null si jamais). */
  cotisationOfferteDes: number | null
  /** Miles par euro dépensé, par catégorie. */
  taux: Record<CategorieId, number>
  offre: OffreCarte | null
  lienParrainage: string | null
  accent: Accent
}

export interface Exemple {
  titre: string
  miles: number
  /** Taxes approximatives en euros, null si inconnues. */
  taxesApprox: number | null
  source?: string
}

export interface Config {
  sources: { label: string; url: string; consulteLe: string }[]
  dateMiseAJour: string
  donneesVerifiees: boolean
  site: {
    titre: string
    accroche: string
    sousTitre: string
    nomAuteur: string
    lienAuteur: string
  }
  valeurMile: { basse: number; haute: number }
  categories: Categorie[]
  cartes: Carte[]
  offreDuMoment: {
    actif: boolean
    etiquette: string
    titre: string
    description: string
    dateFin: string
    ctaLabel: string
    lienParrainage: string
  }
  exemples: { intro: string; liste: Exemple[] }
  faq: { question: string; reponse: string }[]
  transparence: { titre: string; texte: string; mentionIndependance: string }
}

/**
 * Vérifie la cohérence du JSON et liste ce qui reste à remplir.
 * Ne bloque jamais le site : renvoie des avertissements affichés en console.
 */
export function validerConfig(c: Config): string[] {
  const avertissements: string[] = []
  const ids = new Set(c.categories.map((cat) => cat.id))

  if (c.valeurMile.basse <= 0 || c.valeurMile.haute < c.valeurMile.basse) {
    avertissements.push('valeurMile : basse doit être > 0 et haute ≥ basse.')
  }

  for (const carte of c.cartes) {
    for (const id of ids) {
      if (typeof carte.taux[id] !== 'number') {
        avertissements.push(`carte ${carte.id} : taux manquant pour la catégorie "${id}".`)
      }
    }
    if (carte.lienParrainage?.includes('PLACEHOLDER')) {
      avertissements.push(`carte ${carte.id} : lien de parrainage encore en PLACEHOLDER.`)
    }
    if (carte.description.includes('PLACEHOLDER')) {
      avertissements.push(`carte ${carte.id} : description encore en PLACEHOLDER.`)
    }
  }

  if (c.offreDuMoment.actif && c.offreDuMoment.lienParrainage.includes('PLACEHOLDER')) {
    avertissements.push('offreDuMoment : lien de parrainage encore en PLACEHOLDER.')
  }
  if (c.transparence.texte.includes('PLACEHOLDER')) {
    avertissements.push('transparence : texte encore en PLACEHOLDER.')
  }
  if (!c.donneesVerifiees) {
    avertissements.push('donneesVerifiees est à false : le bandeau d\'avertissement reste affiché.')
  }
  return avertissements
}

export const config = brut as Config
