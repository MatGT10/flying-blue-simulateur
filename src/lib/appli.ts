/** Vrai quand la page tourne comme application installée (plein écran, sans barre d'adresse). */
export function estEnModeAppli(): boolean {
  if (typeof window === 'undefined') return false
  // ?appli=1 permet de tester le mode application dans un navigateur classique.
  if (new URLSearchParams(window.location.search).get('appli') === '1') return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

export function estIphone(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

const CLE_MAJ = 'fb-actualise'

/** Recharge la page en contournant le cache, et prévient la prochaine page qu'elle vient d'être actualisée. */
export function actualiser(): void {
  try {
    sessionStorage.setItem(CLE_MAJ, '1')
  } catch {
    // stockage indisponible : on recharge quand même
  }
  const url = new URL(window.location.href)
  url.searchParams.set('maj', String(Date.now()))
  window.location.replace(url.toString())
}

/** Vrai une seule fois, juste après une actualisation déclenchée par le site. */
export function vientDEtreActualise(): boolean {
  try {
    if (sessionStorage.getItem(CLE_MAJ) === '1') {
      sessionStorage.removeItem(CLE_MAJ)
      // Nettoie le paramètre technique de l'URL sans recharger.
      const url = new URL(window.location.href)
      if (url.searchParams.has('maj')) {
        url.searchParams.delete('maj')
        window.history.replaceState(null, '', url.toString())
      }
      return true
    }
  } catch {
    // ignore
  }
  return false
}
