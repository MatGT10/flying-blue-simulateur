import { describe, expect, it } from 'vitest'
import { navigateurMobile } from './appli'

const UA = {
  safari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  chromeIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36',
  samsung: 'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0 Mobile Safari/537.36',
  firefox: 'Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
  edge: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 EdgA/130.0',
  opera: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 OPR/85.0',
}

describe('navigateurMobile', () => {
  it('reconnaît Safari sur iPhone', () => expect(navigateurMobile(UA.safari)).toBe('safari'))
  it('reconnaît Chrome sur iPhone et Android', () => {
    expect(navigateurMobile(UA.chromeIphone)).toBe('chrome')
    expect(navigateurMobile(UA.chromeAndroid)).toBe('chrome')
  })
  it('ne confond pas les navigateurs qui se présentent aussi comme Chrome', () => {
    expect(navigateurMobile(UA.samsung)).toBe('samsung')
    expect(navigateurMobile(UA.edge)).toBe('edge')
    expect(navigateurMobile(UA.opera)).toBe('opera')
  })
  it('reconnaît Firefox', () => expect(navigateurMobile(UA.firefox)).toBe('firefox'))
  it('renvoie « autre » sinon', () => expect(navigateurMobile('Mozilla/5.0 (Linux; Android 14) Inconnu/1.0')).toBe('autre'))
})
