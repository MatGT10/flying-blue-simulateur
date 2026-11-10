/**
 * Position de défilement de chaque page, pour la retrouver telle quelle en y revenant,
 * y compris après avoir quitté l'application : l'état est enregistré sur l'appareil.
 */
const CLE = 'fb-navigation'

interface Etat {
  derniere: string // dernière page affichée
  positions: Record<string, number>
}

function lire(): Etat {
  try {
    const v = localStorage.getItem(CLE)
    const o = v ? (JSON.parse(v) as Partial<Etat>) : {}
    const positions: Record<string, number> = {}
    for (const [k, y] of Object.entries(o.positions ?? {})) if (typeof y === 'number') positions[k] = y
    return { derniere: typeof o.derniere === 'string' ? o.derniere : '/', positions }
  } catch {
    return { derniere: '/', positions: {} }
  }
}

const etat = lire()
let minuteur: number | null = null

/** Écrit l'état un peu après la dernière modification, pas à chaque pixel défilé. */
function enregistrer(): void {
  if (minuteur !== null) return
  minuteur = window.setTimeout(() => {
    minuteur = null
    try {
      localStorage.setItem(CLE, JSON.stringify(etat))
    } catch {
      // stockage indisponible
    }
  }, 300)
}

export function memoriserDefilement(chemin: string, y: number): void {
  etat.positions[chemin] = Math.max(0, Math.round(y))
  etat.derniere = chemin
  enregistrer()
}

export function defilementDe(chemin: string): number {
  return etat.positions[chemin] ?? 0
}

export function dernierePage(): string {
  return etat.derniere
}
