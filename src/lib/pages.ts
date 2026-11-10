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
  { to: '/valeur', label: 'Payer en miles ?', titre: 'Quel vol payer en miles ? Valeur d’un mile · Simulateur Flying Blue', icone: 'avion' },
  { to: '/offre', label: 'Offre', titre: 'Offre du moment et parrainage · Simulateur Flying Blue', icone: 'cadeau' },
  { to: '/partenaires', label: 'Partenaires', titre: 'Gagner des miles sans prendre l’avion · Partenaires Flying Blue', icone: 'globe' },
  { to: '/comparatif', label: 'Comparatif', titre: 'Rentabilité et avantages des cartes · Simulateur Flying Blue', icone: 'tendance' },
  { to: '/inscription', label: 'Inscription', titre: 'Comment s’inscrire, étape par étape · Simulateur Flying Blue', icone: 'crayon' },
  { to: '/faq', label: 'FAQ', titre: 'Questions fréquentes et lexique · Simulateur Flying Blue', icone: 'question', menu: false },
]

/** Pages des menus et du balayage. */
export const pagesMenu = pages.filter((p) => p.menu !== false)
