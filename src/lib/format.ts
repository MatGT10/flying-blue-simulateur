const euros = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const entier = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export function fmtEuros(n: number): string {
  return euros.format(Math.round(n))
}

/** Gain net signé : "+ 120 €" ou "− 45 €". */
export function fmtGain(n: number): string {
  const arrondi = Math.round(n)
  if (arrondi === 0) return '0 €'
  const signe = arrondi > 0 ? '+ ' : '− '
  return signe + euros.format(Math.abs(arrondi))
}

export function fmtMiles(n: number): string {
  return `${entier.format(Math.round(n))} miles`
}

export function fmtEntier(n: number): string {
  return entier.format(Math.round(n))
}

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}
