import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react'
import type { NavigateFunction } from 'react-router-dom'
import { NB_ONGLETS, colonneOnglet, pagesMenu } from '../../lib/pages'
import { defilementDe } from '../../lib/defilement'
import { libererVerrou, prendreVerrou } from '../../lib/verrouGeste'
import { ecouterPilule, viserBulle } from '../../lib/pilule'

/**
 * Glissement en cours (balayage au doigt sur la page, ou bulle de la pilule déplacée) : les pages
 * voisines nécessaires sont rendues à côté de la page courante, à leur décalage en écrans, et tout
 * suit le doigt. La page d'arrivée n'est décidée qu'au relâchement.
 */
export interface Voisine {
  to: string
  decalage: number // en écrans par rapport à la page courante (-1 = juste avant, +1 = juste après…)
  defilement: number
}
export interface Glisse {
  voisines: Voisine[]
  haut: number // position de la fenêtre visible, dans la scène
  hauteur: number // hauteur visible sous la barre du haut
  termine: boolean // le geste est allé au bout : la navigation qui suit se fait sans animation
}

const MOBILE = 640 // px : en dessous, le balayage entre pages est actif
const MARGE = 8 // px de mouvement avant de décider si le geste est un balayage
const SEUIL_SECOURS = 70 // px : balayage jugé à la fin du geste quand le suivi au doigt n'a pas pu démarrer
const COURBE = 'cubic-bezier(0.32, 0.72, 0, 1)'


interface Refs {
  sceneRef: RefObject<HTMLElement | null>
  piste: RefObject<HTMLDivElement | null>
  pathnameRef: RefObject<string>
  navigateRef: RefObject<NavigateFunction>
  glisseRef: RefObject<Glisse | null>
  setGlisse: Dispatch<SetStateAction<Glisse | null>>
}

/** Glissement des pages : balayage au doigt sur la page, ou bulle de la pilule déplacée. */
export function useGlissement({ sceneRef, piste, pathnameRef, navigateRef, glisseRef, setGlisse }: Refs) {
  useEffect(() => {
    const racine = document.documentElement
    const n = pagesMenu.length
    const indexCourant = () => pagesMenu.findIndex((p) => p.to === pathnameRef.current)
    const borne = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

    const voisineDe = (i0: number, k: number): Voisine => ({ to: pagesMenu[k].to, decalage: k - i0, defilement: defilementDe(pagesMenu[k].to) })
    const mesures = () => {
      const entete = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      return { haut: entete - (sceneRef.current?.getBoundingClientRect().top ?? 0), hauteur: window.innerHeight - entete }
    }
    /** Ouvre le glissement avec les pages d'indices donnés rendues à côté de la page courante. */
    const ouvrir = (i0: number, indices: number[]) => {
      const voisines = indices.filter((k) => k >= 0 && k < n && k !== i0).map((k) => voisineDe(i0, k))
      setGlisse({ voisines, ...mesures(), termine: false })
      racine.classList.add('balayage')
    }
    /** Rend une page de plus si la bulle l'atteint (elle peut traverser plusieurs onglets). */
    const assurerVoisine = (i0: number, k: number) => {
      if (k < 0 || k >= n || k === i0) return
      setGlisse((g) => (g && !g.voisines.some((v) => v.decalage === k - i0) ? { ...g, voisines: [...g.voisines, voisineDe(i0, k)] } : g))
    }
    /** Place la piste à un décalage en écrans (fractionnaire), et fait suivre le titre du bandeau. */
    const positionner = (decalage: number) => {
      const p = piste.current
      if (p) {
        p.style.transition = 'none'
        p.style.transform = `translate3d(${-decalage * window.innerWidth}px, 0, 0)`
      }
      racine.style.setProperty('--balayage-progression', String(borne(-decalage, -1, 1)))
    }
    const finBulle = () => {
      racine.classList.remove('balayage', 'balayage-fin')
      racine.style.removeProperty('--balayage-progression')
    }
    /** Termine le geste : vers la page d'indice k (null : retour sur la page courante). */
    const terminerVers = (i0: number, k: number | null, bulle: boolean) => {
      const p = piste.current
      if (!p) return
      const cible = k !== null && k !== i0 && k >= 0 && k < n ? k : null
      const decalage = cible === null ? 0 : cible - i0
      p.style.transition = `transform 280ms ${COURBE}`
      p.style.transform = `translate3d(${-decalage * 100}%, 0, 0)`
      racine.classList.add('balayage-fin')
      racine.style.setProperty('--balayage-progression', String(borne(-decalage, -1, 1)))
      if (bulle) {
        // Balayage sur la page : la bulle d'onglet se pose sur sa colonne d'arrivée avec la page.
        const colonne = colonneOnglet(cible === null ? pathnameRef.current : pagesMenu[cible].to)
        if (colonne >= 0) viserBulle(colonne, 'libre')
      }
      let fini = false
      const fin = () => {
        if (fini) return
        fini = true
        p.removeEventListener('transitionend', fin)
        if (cible !== null) {
          // La piste reste décalée jusqu'au rendu de la nouvelle page (remise à zéro dans le layout effect).
          setGlisse((g) => (g ? { ...g, termine: true } : g))
          navigateRef.current(pagesMenu[cible].to)
        } else {
          p.style.transition = ''
          p.style.transform = ''
          finBulle()
          setGlisse(null)
        }
      }
      p.addEventListener('transitionend', fin)
      window.setTimeout(fin, 340)
    }

    // --- Balayage au doigt sur la page
    const g: { d: { x: number; y: number; t: number; decide: boolean; actif: boolean; i0: number } | null } = { d: null }
    /** Décalage effectif en écrans : sans page de ce côté, le doigt tire avec résistance (rebond iOS). */
    const decalageDoigt = (dx: number, i0: number) => {
      const brut = -dx / window.innerWidth
      if ((brut > 0 && i0 + 1 >= n) || (brut < 0 && i0 - 1 < 0)) return brut * 0.28
      return brut
    }
    const colonneGlisse = (dx: number, i0: number) => {
      const de = colonneOnglet(pathnameRef.current)
      const k = dx < 0 ? i0 + 1 : i0 - 1
      if (de < 0 || k < 0 || k >= n) return de
      const vers = colonneOnglet(pagesMenu[k].to)
      return vers < 0 ? de : de + (vers - de) * Math.min(1, Math.abs(dx) / window.innerWidth)
    }

    const onMove = (e: TouchEvent) => {
      const d = g.d
      if (!d) return
      const t = e.touches[0]
      const dx = t.clientX - d.x
      const dy = t.clientY - d.y
      if (!d.decide) {
        if (Math.abs(dx) < MARGE && Math.abs(dy) < MARGE) return
        d.decide = true
        // Suivi au doigt dès que le geste part plus à l'horizontale qu'à la verticale. On ne se fie pas
        // à e.cancelable : WebKit le met à faux quand touch-action interdit le défilement horizontal,
        // ce qui est justement notre cas. Sinon, le geste reste jugé à la fin (voir onEnd).
        if (Math.abs(dx) <= Math.abs(dy) || !prendreVerrou('balayage')) return
        const i0 = indexCourant()
        if (i0 < 0) {
          libererVerrou('balayage')
          return
        }
        d.actif = true
        d.i0 = i0
        ouvrir(i0, [i0 - 1, i0 + 1])
      }
      if (!d.actif) return
      if (e.cancelable) e.preventDefault()
      positionner(decalageDoigt(dx, d.i0))
      viserBulle(colonneGlisse(dx, d.i0), 'suivi')
    }
    const retirerMove = () => window.removeEventListener('touchmove', onMove)

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || window.innerWidth >= MOBILE || glisseRef.current) return
      const cible = e.target instanceof Element ? e.target : null
      // Boutons et liens n'empêchent pas le balayage (un toucher sans mouvement reste un clic) ;
      // seuls les champs, la feuille « Plus » et les zones marquées (tableau défilant, pilule) sont exclus.
      if (cible?.closest('[data-sans-geste], [role="dialog"], input, textarea, select')) return
      const t = e.touches[0]
      g.d = { x: t.clientX, y: t.clientY, t: Date.now(), decide: false, actif: false, i0: -1 }
      window.addEventListener('touchmove', onMove, { passive: false })
    }

    const onEnd = (e: TouchEvent) => {
      retirerMove()
      const dd = g.d
      g.d = null
      if (!dd) return
      libererVerrou('balayage')
      const t = e.changedTouches[0]
      const dx = t.clientX - dd.x
      if (!dd.actif) {
        // Secours : le suivi au doigt n'a pas démarré (geste parti en biais), mais le geste entier
        // est un balayage net → changement de page animé.
        const dy = t.clientY - dd.y
        if (Math.abs(dx) >= SEUIL_SECOURS && Math.abs(dy) < Math.abs(dx) / 2 && Date.now() - dd.t < 600) {
          const i0 = indexCourant()
          const voisine = i0 < 0 ? undefined : dx < 0 ? pagesMenu[i0 + 1] : pagesMenu[i0 - 1]
          if (voisine) navigateRef.current(voisine.to)
        }
        return
      }
      const vitesse = Math.abs(dx) / Math.max(1, Date.now() - dd.t) // px par ms
      const valide = Math.abs(dx) > window.innerWidth * 0.3 || (vitesse > 0.45 && Math.abs(dx) > 30)
      terminerVers(dd.i0, valide ? (dx < 0 ? dd.i0 + 1 : dd.i0 - 1) : null, true)
    }
    const onCancel = () => {
      retirerMove()
      const dd = g.d
      g.d = null
      libererVerrou('balayage')
      if (dd?.actif) terminerVers(dd.i0, null, true)
    }

    // --- Bulle de la pilule déplacée au doigt : les pages coulissent sous elle
    const pilule: { i0: number } = { i0: -1 }
    const arreterPilule = ecouterPilule((ev) => {
      switch (ev.phase) {
        case 'debut': {
          const i0 = indexCourant()
          pilule.i0 = i0
          if (i0 < 0 || g.d?.actif) return
          // Seules les pages des quatre onglets peuvent apparaître : au-delà, c'est la feuille « Plus ».
          ouvrir(i0, [i0 - 1, i0 + 1].filter((k) => k < NB_ONGLETS))
          return
        }
        case 'mouvement': {
          const i0 = pilule.i0
          if (i0 < 0) return
          // Colonnes 0 à 3 : une page chacune ; au-delà (vers « Plus »), les pages restent sur la
          // dernière et seule la bulle continue : aucune page n'apparaît à droite d'Offre.
          const dernier = Math.min(n - 1, NB_ONGLETS - 1)
          const p = Math.min(ev.position, dernier)
          assurerVoisine(i0, Math.floor(p))
          assurerVoisine(i0, Math.ceil(p))
          positionner(p - i0)
          return
        }
        case 'fin':
          if (pilule.i0 < 0) {
            if (ev.colonne < n) navigateRef.current(pagesMenu[ev.colonne].to)
            return
          }
          terminerVers(pilule.i0, ev.colonne < n ? ev.colonne : null, false)
          pilule.i0 = -1
          return
        case 'annule':
          if (pilule.i0 >= 0) terminerVers(pilule.i0, null, false)
          pilule.i0 = -1
          return
      }
    })

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    window.addEventListener('touchcancel', onCancel, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onCancel)
      retirerMove()
      arreterPilule()
      finBulle()
    }
  }, [sceneRef, piste, pathnameRef, navigateRef, glisseRef, setGlisse])
}
