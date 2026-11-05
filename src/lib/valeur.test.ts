import { describe, expect, it } from 'vitest'
import { centimesParMile, classerVols, verdict, volsDepuisParams, volsVersParams } from './valeur'

const seuils = { mauvais: 0.8, excellent: 1.5 }

describe('centimesParMile', () => {
  it('calcule (cash − taxes) / miles en centimes', () => {
    // 300 € cash, 50 € de taxes, 20 000 miles → 250 € / 20 000 = 1,25 centime
    expect(centimesParMile(300, 20000, 50)).toBeCloseTo(1.25)
  })
  it('renvoie null sans prix ou sans miles', () => {
    expect(centimesParMile(0, 20000, 50)).toBeNull()
    expect(centimesParMile(300, 0, 50)).toBeNull()
    expect(centimesParMile(Number.NaN, 20000, 50)).toBeNull()
  })
  it('peut être négatif si les taxes dépassent le prix cash', () => {
    expect(centimesParMile(100, 10000, 150)).toBeCloseTo(-0.5)
  })
})

describe('verdict', () => {
  it('classe selon les seuils', () => {
    expect(verdict(0.5, seuils)).toBe('mauvais')
    expect(verdict(0.8, seuils)).toBe('correct')
    expect(verdict(1.49, seuils)).toBe('correct')
    expect(verdict(1.5, seuils)).toBe('excellent')
    expect(verdict(null, seuils)).toBe('invalide')
  })
})

describe('classerVols', () => {
  it('trie du plus rentable au moins rentable, incomplets en dernier', () => {
    const vols = [
      { id: 'a', libelle: 'A', prixCash: 200, miles: 20000, taxes: 50 }, // 0,75
      { id: 'b', libelle: 'B', prixCash: 900, miles: 50000, taxes: 150 }, // 1,5
      { id: 'c', libelle: 'C', prixCash: 0, miles: 0, taxes: 0 }, // invalide
    ]
    const r = classerVols(vols, seuils)
    expect(r.map((v) => v.id)).toEqual(['b', 'a', 'c'])
    expect(r[0].verdict).toBe('excellent')
    expect(r[1].verdict).toBe('mauvais')
    expect(r[2].verdict).toBe('invalide')
    expect(r[0].economie).toBe(750)
  })
})

describe('encodage URL', () => {
  it('encode puis relit les vols', () => {
    const vols = [{ id: 'x', libelle: 'Paris → Lisbonne | mars', prixCash: 180, miles: 10000, taxes: 50 }]
    const p = volsVersParams(vols)
    const relus = volsDepuisParams(p)
    expect(relus).toHaveLength(1)
    expect(relus[0].libelle).toBe('Paris → Lisbonne   mars')
    expect(relus[0].prixCash).toBe(180)
    expect(relus[0].miles).toBe(10000)
    expect(relus[0].taxes).toBe(50)
  })
  it('ignore les vols vides', () => {
    expect(volsVersParams([{ id: 'x', libelle: '', prixCash: 0, miles: 0, taxes: 0 }]).getAll('v')).toEqual([])
  })
})
