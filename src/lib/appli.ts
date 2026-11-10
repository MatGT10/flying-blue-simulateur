/** Vrai quand la page tourne comme application installée (plein écran, sans barre d'adresse). */
export function estEnModeAppli(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

export function estIphone(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/** Recharge la page en contournant le cache du navigateur. */
export function actualiser(): void {
  const url = new URL(window.location.href)
  url.searchParams.set('maj', String(Date.now()))
  window.location.replace(url.toString())
}
