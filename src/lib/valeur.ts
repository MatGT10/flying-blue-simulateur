import { nettoyer } from './calcul'

/** Un vol saisi par l'utilisateur. Les montants sont en euros, les miles en nombre. */
export interface VolSaisi {
  id: string
  libelle: string
  prixCash: number
  miles: number
  taxes: number
}

export type Verdict = 'mauvais' | 'correct' | 'excellent' | 'invalide'

export interface SeuilsValeur {
  /** En centimes d'euro par mile. En dessous : payer en euros. */
  mauvais: number
  /** En centimes. Au-dessus : excellente affaire. */
  excellent: number
}

export interface VolEvalue extends VolSaisi {
  /** Euros économisés en payant en miles (prix cash − taxes). */
  economie: number
  /** Valeur obtenue par mile, en centimes d'euro. null si saisie incomplète. */
  centimesParMile: number | null
  verdict: Verdict
}

/** (prix cash − taxes) / miles, en centimes. null si miles ≤ 0 ou prix ≤ 0. */
export function centimesParMile(prixCash: number, miles: number, taxes: number): number | null {
  const p = nettoyer(prixCash)
  const m = nettoyer(miles)
  const t = nettoyer(taxes)
  if (p <= 0 || m <= 0) return null
  return ((p - t) / m) * 100
}

export function verdict(centimes: number | null, seuils: SeuilsValeur): Verdict {
  if (centimes === null) return 'invalide'
  if (centimes < seuils.mauvais) return 'mauvais'
  if (centimes >= seuils.excellent) return 'excellent'
  return 'correct'
}

export function evaluerVol(vol: VolSaisi, seuils: SeuilsValeur): VolEvalue {
  const c = centimesParMile(vol.prixCash, vol.miles, vol.taxes)
  return {
    ...vol,
    economie: Math.max(0, nettoyer(vol.prixCash) - nettoyer(vol.taxes)),
    centimesParMile: c,
    verdict: verdict(c, seuils),
  }
}

/** Évalue et classe du plus rentable au moins rentable ; les saisies incomplètes en dernier. */
export function classerVols(vols: VolSaisi[], seuils: SeuilsValeur): VolEvalue[] {
  return vols
    .map((v) => evaluerVol(v, seuils))
    .sort((a, b) => {
      if (a.centimesParMile === null && b.centimesParMile === null) return 0
      if (a.centimesParMile === null) return 1
      if (b.centimesParMile === null) return -1
      return b.centimesParMile - a.centimesParMile
    })
}

/** Encodage des vols dans l'URL : v=libelle|cash|miles|taxes (répété). */
export function volsVersParams(vols: VolSaisi[]): URLSearchParams {
  const p = new URLSearchParams()
  for (const v of vols) {
    if (nettoyer(v.prixCash) <= 0 && nettoyer(v.miles) <= 0) continue
    p.append('v', [v.libelle.replace(/\|/g, ' '), v.prixCash, v.miles, v.taxes].join('|'))
  }
  return p
}

export function volsDepuisParams(params: URLSearchParams): VolSaisi[] {
  return params
    .getAll('v')
    .map((s, i) => {
      const [libelle = '', cash = '0', miles = '0', taxes = '0'] = s.split('|')
      return {
        id: `url-${i}`,
        libelle: libelle.slice(0, 80),
        prixCash: nettoyer(cash),
        miles: nettoyer(miles),
        taxes: nettoyer(taxes),
      }
    })
    .filter((v) => v.prixCash > 0 || v.miles > 0)
}
