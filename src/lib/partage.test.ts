import { describe, expect, it } from 'vitest'
import { construireUrlPartage, lireEtatDepuisUrl } from './partage'

const categories = [
  { id: 'courant', label: '', aide: '', defaut: 800 },
  { id: 'afklm', label: '', aide: '', defaut: 100 },
]

describe('partage', () => {
  it('encode puis relit les saisies et le mode', () => {
    const url = construireUrlPartage({ brutes: { courant: '1200', afklm: '50' }, mode: 'premiereAnnee' }, categories, 'https://x.test/')
    expect(url).toBe('https://x.test/?courant=1200&afklm=50&mode=1#resultats')
    const etat = lireEtatDepuisUrl(categories, new URL(url).search)
    expect(etat.brutes).toEqual({ courant: '1200', afklm: '50' })
    expect(etat.mode).toBe('premiereAnnee')
  })

  it('ignore les valeurs invalides et renvoie vide sans paramètres', () => {
    expect(lireEtatDepuisUrl(categories, '')).toEqual({})
    const etat = lireEtatDepuisUrl(categories, '?courant=abc&afklm=-5&mode=0')
    expect(etat.brutes).toEqual({ afklm: '0' })
    expect(etat.mode).toBe('croisiere')
  })
})
