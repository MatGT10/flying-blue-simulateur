/** Un seul geste à la fois : le tirage d'actualisation et le balayage entre pages s'excluent. */
export const verrou: { geste: 'tirage' | 'balayage' | null } = { geste: null }

export function prendreVerrou(g: 'tirage' | 'balayage'): boolean {
  if (verrou.geste !== null && verrou.geste !== g) return false
  verrou.geste = g
  return true
}

export function libererVerrou(g: 'tirage' | 'balayage'): void {
  if (verrou.geste === g) verrou.geste = null
}
