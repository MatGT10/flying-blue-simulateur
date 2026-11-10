/** Thème clair ou sombre : choix mémorisé sur l'appareil, sinon réglage du système. */
export type Theme = 'clair' | 'sombre'

const CLE = 'fb-theme'

export function themeSysteme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair'
}

export function themeChoisi(): Theme | null {
  try {
    const v = localStorage.getItem(CLE)
    return v === 'clair' || v === 'sombre' ? v : null
  } catch {
    return null
  }
}

export function themeActuel(): Theme {
  return themeChoisi() ?? themeSysteme()
}

/** Applique le thème au document (et à la barre d'état du téléphone), en le mémorisant si demandé. */
export function appliquerTheme(t: Theme, memoriser: boolean): void {
  document.documentElement.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'sombre' ? '#000000' : '#f2f2f7')
  if (memoriser) {
    try {
      localStorage.setItem(CLE, t)
    } catch {
      // stockage indisponible : le choix vaut pour cette page seulement
    }
  }
}
