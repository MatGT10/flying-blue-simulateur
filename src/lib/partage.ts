import type { Categorie } from './config'
import type { Mode } from './calcul'

export interface EtatPartage {
  brutes: Record<string, string>
  mode: Mode
}

/** Lit les saisies encodées dans l'URL (?courant=800&afklm=100&mode=1). */
export function lireEtatDepuisUrl(categories: Categorie[], search = window.location.search): Partial<EtatPartage> {
  const params = new URLSearchParams(search)
  const brutes: Record<string, string> = {}
  let trouve = false
  for (const c of categories) {
    const v = params.get(c.id)
    if (v !== null && v !== '' && Number.isFinite(Number(v))) {
      brutes[c.id] = String(Math.max(0, Number(v)))
      trouve = true
    }
  }
  const mode: Mode | undefined = params.get('mode') === '1' ? 'premiereAnnee' : params.get('mode') === '0' ? 'croisiere' : undefined
  return { ...(trouve ? { brutes } : {}), ...(mode ? { mode } : {}) }
}

/** Construit l'URL de partage à partir des saisies. */
export function construireUrlPartage(etat: EtatPartage, categories: Categorie[], base = window.location.origin + window.location.pathname): string {
  const params = new URLSearchParams()
  for (const c of categories) {
    const v = etat.brutes[c.id]
    if (v !== undefined && v !== '') params.set(c.id, String(Number(v) || 0))
  }
  params.set('mode', etat.mode === 'premiereAnnee' ? '1' : '0')
  return `${base}?${params.toString()}#resultats`
}

/** Partage natif si disponible (mobile), sinon copie dans le presse-papiers. Renvoie 'partage' | 'copie' | 'echec'. */
export async function partager(url: string, titre: string, texte: string): Promise<'partage' | 'copie' | 'echec'> {
  try {
    if (typeof navigator !== 'undefined' && 'share' in navigator && navigator.canShare?.({ url })) {
      await navigator.share({ title: titre, text: texte, url })
      return 'partage'
    }
  } catch (e) {
    // L'utilisateur a annulé le partage natif : on ne copie pas à sa place.
    if (e instanceof DOMException && e.name === 'AbortError') return 'echec'
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copie'
  } catch {
    // Presse-papiers moderne refusé : méthode de secours via une zone de texte temporaire.
    return copierAncienneMethode(url) ? 'copie' : 'echec'
  }
}

function copierAncienneMethode(texte: string): boolean {
  try {
    const zone = document.createElement('textarea')
    zone.value = texte
    zone.setAttribute('readonly', '')
    zone.style.position = 'fixed'
    zone.style.opacity = '0'
    document.body.appendChild(zone)
    zone.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(zone)
    return ok
  } catch {
    return false
  }
}
