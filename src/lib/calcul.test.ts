import { describe, expect, it } from 'vitest'
import type { Config } from './config'
import { calculerCarte, moisPourAtteindre, nettoyer, simuler } from './calcul'

/** Config de test minimale, indépendante du config.json réel. */
const cfg = {
  valeurMile: { basse: 0.01, haute: 0.02 },
  categories: [
    { id: 'courant', label: 'Courant', aide: '', defaut: 0 },
    { id: 'afklm', label: 'AF-KLM', aide: '', defaut: 0 },
  ],
  cartes: [
    {
      id: 'aucune', nom: 'Aucune', courte: 'Aucune', description: '',
      cotisationAnnuelle: 0, cotisationOfferteDes: null, taux: { courant: 0, afklm: 0 }, offre: null,
      lienParrainage: null, accent: 'neutre',
    },
    {
      id: 'silver', nom: 'Silver', courte: 'Silver', description: '',
      cotisationAnnuelle: 60, cotisationOfferteDes: 10000, taux: { courant: 1, afklm: 2 },
      offre: { premiereAnneeOfferte: true, milesBienvenue: 5000, conditionDepense: 1500, conditionDelaiMois: 3 },
      lienParrainage: null, accent: 'argent',
    },
    {
      id: 'platinum', nom: 'Platinum', courte: 'Platinum', description: '',
      cotisationAnnuelle: 600, cotisationOfferteDes: null, taux: { courant: 1.5, afklm: 3 },
      offre: { premiereAnneeOfferte: false, milesBienvenue: 40000, conditionDepense: 5000, conditionDelaiMois: 3 },
      lienParrainage: null, accent: 'platine',
    },
  ],
} as unknown as Config

describe('nettoyer', () => {
  it('ramène vide, négatif et NaN à 0', () => {
    expect(nettoyer('')).toBe(0)
    expect(nettoyer(-10)).toBe(0)
    expect(nettoyer('abc')).toBe(0)
    expect(nettoyer(undefined)).toBe(0)
    expect(nettoyer('250')).toBe(250)
  })
})

describe('calculerCarte', () => {
  it('ne rapporte rien sans carte', () => {
    const r = calculerCarte(cfg.cartes[0], { courant: 1000, afklm: 100 }, cfg, 'croisiere')
    expect(r.milesTotal).toBe(0)
    expect(r.gainNetBas).toBe(0)
    expect(r.pointMortMensuel).toBeNull()
  })

  it('calcule miles, valeur et gain net en régime de croisière', () => {
    // 500 €/mois courant ×12 ×1 = 6000 miles ; 100 €/mois AF ×12 ×2 = 2400 miles
    const r = calculerCarte(cfg.cartes[1], { courant: 500, afklm: 100 }, cfg, 'croisiere')
    expect(r.milesTotal).toBe(8400)
    expect(r.valeurBasse).toBeCloseTo(84)
    expect(r.valeurHaute).toBeCloseTo(168)
    expect(r.cotisation).toBe(60)
    expect(r.gainNetBas).toBeCloseTo(24)
    expect(r.gainNetHaut).toBeCloseTo(108)
    expect(r.milesBienvenue).toBe(0)
  })

  it('offre la cotisation et le bonus en première année si la condition est atteinte', () => {
    // 600 €/mois × 3 mois = 1800 ≥ 1500 → bonus
    const r = calculerCarte(cfg.cartes[1], { courant: 600, afklm: 0 }, cfg, 'premiereAnnee')
    expect(r.cotisation).toBe(0)
    expect(r.milesBienvenue).toBe(5000)
    expect(r.milesTotal).toBe(7200 + 5000)
    expect(r.bienvenueNonAtteinte).toBe(false)
  })

  it('refuse le bonus si la condition de dépense n est pas atteinte', () => {
    // 400 €/mois × 3 = 1200 < 1500
    const r = calculerCarte(cfg.cartes[1], { courant: 400, afklm: 0 }, cfg, 'premiereAnnee')
    expect(r.milesBienvenue).toBe(0)
    expect(r.bienvenueNonAtteinte).toBe(true)
    expect(r.cotisation).toBe(0)
  })

  it('garde la cotisation en première année si elle n est pas offerte', () => {
    const r = calculerCarte(cfg.cartes[2], { courant: 2000, afklm: 0 }, cfg, 'premiereAnnee')
    expect(r.cotisation).toBe(600)
    expect(r.milesBienvenue).toBe(40000)
  })

  it('calcule un point mort cohérent', () => {
    // Silver, 100 % courant à 1 mile/€ et 0,01 €/mile : 60 € de cotisation → 6000 miles → 6000 €/an → 500 €/mois
    const r = calculerCarte(cfg.cartes[1], { courant: 100, afklm: 0 }, cfg, 'croisiere')
    expect(r.pointMortMensuel).toBeCloseTo(500)
    // Et à exactement 500 €/mois, le gain net bas est nul.
    const r2 = calculerCarte(cfg.cartes[1], { courant: 500, afklm: 0 }, cfg, 'croisiere')
    expect(r2.gainNetBas).toBeCloseTo(0)
  })

  it('offre la cotisation quand les dépenses annuelles atteignent le seuil de gratuité', () => {
    // Silver : gratuite dès 10 000 €/an → 834 €/mois suffisent
    const r = calculerCarte(cfg.cartes[1], { courant: 834, afklm: 0 }, cfg, 'croisiere')
    expect(r.cotisation).toBe(0)
    expect(r.cotisationOfferteParDepenses).toBe(true)
    // Juste en dessous : cotisation pleine
    const r2 = calculerCarte(cfg.cartes[1], { courant: 833, afklm: 0 }, cfg, 'croisiere')
    expect(r2.cotisation).toBe(60)
    expect(r2.cotisationOfferteParDepenses).toBe(false)
    // Point mort brut 500 €/mois < seuil mensualisé 833 € : le brut reste.
    expect(r2.pointMortMensuel).toBeCloseTo(500)
    // Avec un taux deux fois plus faible, le brut vaut 1 000 €/mois : plafonné au seuil 10 000 / 12.
    const silverFaible = { ...cfg.cartes[1], taux: { courant: 0.5, afklm: 1 } }
    const r3 = calculerCarte(silverFaible, { courant: 100, afklm: 0 }, cfg, 'croisiere')
    expect(r3.pointMortMensuel).toBeCloseTo(10000 / 12)
  })

  it('ne produit jamais NaN avec des saisies vides', () => {
    const r = calculerCarte(cfg.cartes[2], {}, cfg, 'croisiere')
    expect(Number.isNaN(r.gainNetMedian)).toBe(false)
    expect(r.gainNetBas).toBe(-600)
  })
})

describe('simuler', () => {
  it('désigne "aucune carte" quand rien n est rentable', () => {
    const s = simuler({ courant: 50, afklm: 0 }, cfg, 'croisiere')
    expect(s.meilleure.carte.id).toBe('aucune')
  })

  it('désigne la Platinum pour un gros volume', () => {
    const s = simuler({ courant: 10000, afklm: 1000 }, cfg, 'croisiere')
    expect(s.meilleure.carte.id).toBe('platinum')
  })

  it('désigne la Silver pour un volume moyen', () => {
    const s = simuler({ courant: 800, afklm: 50 }, cfg, 'croisiere')
    expect(s.meilleure.carte.id).toBe('silver')
  })
})

describe('moisPourAtteindre', () => {
  it('arrondit au mois supérieur', () => {
    expect(moisPourAtteindre(15000, 12000)).toBe(15)
    expect(moisPourAtteindre(15000, 0)).toBeNull()
  })
})
