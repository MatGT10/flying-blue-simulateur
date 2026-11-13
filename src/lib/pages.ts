/** Pages du site, dans l'ordre de navigation (balayage, onglets, pied de page). */
export interface Page {
  to: string
  label: string
  titre: string
  icone: string
  /** Faux : la page n'apparaît que dans le pied de page (ni onglet, ni menu Plus, ni balayage). */
  menu?: boolean
}

export const pages: Page[] = [
  { to: '/', label: 'Accueil', titre: 'Les miles Flying Blue expliqués simplement · Simulateur et guide', icone: 'maison' },
  { to: '/simulateur', label: 'Simulateur', titre: 'Simulateur de miles Flying Blue · Silver, Gold ou Platinum ?', icone: 'calculatrice' },
  { to: '/comparatif', label: 'Comparatif', titre: 'Rentabilité et avantages des cartes · Simulateur Flying Blue', icone: 'tendance' },
  { to: '/offre', label: 'Offre', titre: 'Offre du moment et parrainage · Simulateur Flying Blue', icone: 'cadeau' },
  { to: '/inscription', label: 'Inscription', titre: 'Comment s’inscrire, étape par étape · Simulateur Flying Blue', icone: 'crayon' },
  { to: '/valeur', label: 'Payer en miles ?', titre: 'Quel vol payer en miles ? Valeur d’un mile · Simulateur Flying Blue', icone: 'avion' },
  { to: '/partenaires', label: 'Partenaires', titre: 'Gagner des miles sans prendre l’avion · Partenaires Flying Blue', icone: 'globe' },
  { to: '/faq', label: 'FAQ', titre: 'Questions fréquentes et lexique · Simulateur Flying Blue', icone: 'question', menu: false },
  { to: '/mentions', label: 'Mentions légales', titre: 'Mentions légales · Simulateur Flying Blue', icone: 'point', menu: false },
]

/** Pages des menus et du balayage. */
export const pagesMenu = pages.filter((p) => p.menu !== false)

/** Les 4 premières pages du menu ont leur onglet ; les suivantes passent par « Plus » (colonne 4). */
export const NB_ONGLETS = 4
export const COLONNE_PLUS = NB_ONGLETS

export type Sens = 'gauche' | 'droite' | 'fondu'

/** Vers une page plus loin dans le menu : la nouvelle arrive par la droite ; plus tôt : par la gauche. */
export function sensEntre(de: string, vers: string): Sens {
  const i = pagesMenu.findIndex((p) => p.to === de)
  const j = pagesMenu.findIndex((p) => p.to === vers)
  if (i < 0 || j < 0 || i === j) return 'fondu'
  return j > i ? 'gauche' : 'droite'
}

/** Colonne de la barre d'onglets (0 à 4) où se trouve une page, -1 si elle n'y est pas. */
export function colonneOnglet(to: string): number {
  const i = pagesMenu.findIndex((p) => p.to === to)
  if (i < 0) return -1
  return i < NB_ONGLETS ? i : COLONNE_PLUS
}
