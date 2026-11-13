/**
 * Thème clair ou sombre. Le réglage du téléphone a le dernier mot : un choix fait avec le bouton
 * est mémorisé avec le réglage du système à ce moment-là, et il est abandonné dès que le système
 * change (en direct, au retour dans l'app, ou à l'ouverture suivante).
 */
export type Theme = 'clair' | 'sombre'

const CLE = 'fb-theme'
const CLE_SYSTEME = 'fb-theme-systeme' // réglage du système au moment du choix

export function themeSysteme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair'
}

/** Choix explicite encore valable (le système n'a pas changé depuis), sinon null. */
export function themeChoisi(): Theme | null {
  try {
    const v = localStorage.getItem(CLE)
    if (v !== 'clair' && v !== 'sombre') return null
    if (localStorage.getItem(CLE_SYSTEME) !== themeSysteme()) {
      effacerChoix()
      return null
    }
    return v
  } catch {
    return null
  }
}

export function effacerChoix(): void {
  try {
    localStorage.removeItem(CLE)
    localStorage.removeItem(CLE_SYSTEME)
  } catch {
    // stockage indisponible
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
      localStorage.setItem(CLE_SYSTEME, themeSysteme())
    } catch {
      // stockage indisponible : le choix vaut pour cette page seulement
    }
  }
}

/**
 * Suit le réglage du téléphone : en direct, au retour dans l'app (iOS ne signale pas toujours le
 * changement quand l'app est en arrière-plan) et à chaque réaffichage. Un changement du système
 * efface le choix manuel et s'applique. Renvoie la fonction d'arrêt.
 */
export function suivreSysteme(onChange: (t: Theme) => void): () => void {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  let dernier = themeSysteme()
  const verifier = () => {
    const s = themeSysteme()
    if (s === dernier) return
    dernier = s
    effacerChoix()
    appliquerTheme(s, false)
    onChange(s)
  }
  media.addEventListener('change', verifier)
  document.addEventListener('visibilitychange', verifier)
  window.addEventListener('pageshow', verifier)
  window.addEventListener('focus', verifier)
  return () => {
    media.removeEventListener('change', verifier)
    document.removeEventListener('visibilitychange', verifier)
    window.removeEventListener('pageshow', verifier)
    window.removeEventListener('focus', verifier)
  }
}
