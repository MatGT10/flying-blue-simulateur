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

/** Nom du bundle actuellement chargé (ex. index-AbC123.js), null en développement. */
function bundleCourant(): string | null {
  const s = document.querySelector<HTMLScriptElement>('script[src*="/assets/index-"]')
  const m = s?.src.match(/index-[A-Za-z0-9_-]+\.js/)
  return m ? m[0] : null
}

/**
 * Vrai si la version chargée est la dernière publiée : on relit la page d'accueil
 * hors cache et on compare le nom du bundle. En développement (pas de bundle), vrai.
 */
export async function estDerniereVersion(): Promise<boolean> {
  const courant = bundleCourant()
  if (!courant) return true
  try {
    const r = await fetch('/?verif=' + Date.now(), { cache: 'no-store' })
    const html = await r.text()
    const m = html.match(/index-[A-Za-z0-9_-]+\.js/)
    return !m || m[0] === courant
  } catch {
    // Hors ligne : on ne peut pas affirmer que c'est à jour.
    return false
  }
}

const CLE_SECONDE = 'fb-seconde-tentative'
export function secondeTentative(): boolean {
  try {
    return sessionStorage.getItem(CLE_SECONDE) === '1'
  } catch {
    return false
  }
}
export function marquerSecondeTentative(oui: boolean): void {
  try {
    if (oui) sessionStorage.setItem(CLE_SECONDE, '1')
    else sessionStorage.removeItem(CLE_SECONDE)
  } catch {
    // ignore
  }
}

export type NavigateurMobile = 'safari' | 'chrome' | 'samsung' | 'firefox' | 'edge' | 'opera' | 'autre'

/**
 * Navigateur mobile, d'après la signature envoyée par l'appareil. Sert à décrire le bon menu
 * pour « Ajouter à l'écran d'accueil » : chaque navigateur le range ailleurs.
 * L'ordre des tests compte : Edge, Opera et Samsung Internet se présentent aussi comme Chrome.
 */
export function navigateurMobile(ua: string = typeof navigator === 'undefined' ? '' : navigator.userAgent): NavigateurMobile {
  if (/EdgA|EdgiOS/i.test(ua)) return 'edge'
  if (/OPR|Opera|OPT\//i.test(ua)) return 'opera'
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  if (/Firefox|FxiOS/i.test(ua)) return 'firefox'
  if (/CriOS|Chrome/i.test(ua)) return 'chrome'
  if (/Safari/i.test(ua) && /iPhone|iPad|iPod/i.test(ua)) return 'safari'
  return 'autre'
}
