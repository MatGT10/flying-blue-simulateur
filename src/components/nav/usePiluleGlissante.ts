import { useEffect, useRef, type RefObject } from 'react'
import { COLONNE_PLUS, NB_ONGLETS } from '../../lib/pages'
import { annoncerPilule, viserBulle } from '../../lib/pilule'

/**
 * Bulle déplaçable : on la maintient et on la fait coulisser le long de la pilule ; elle part de sa
 * colonne et suit le déplacement du doigt (par le ressort ci-dessus). Pendant ce temps, la scène fait
 * coulisser les pages sous elle (événements de src/lib/pilule.ts). Au relâchement, elle s'aimante sur
 * l'onglet le plus proche : la page sous la bulle se fixe, ou la feuille « Plus » s'ouvre.
 * Un toucher sans mouvement reste un clic.
 */
export interface ActionsPilule {
  ouvrirPlus: () => void
  /** La bulle est tenue : la feuille « Plus » peut s'entrouvrir au rythme de --feuille-progression. */
  debutApercuPlus: () => void
  /** Geste fini sans ouvrir « Plus » : la feuille, si elle s'était entrouverte, redescend. */
  finApercuPlus: () => void
}

export function usePiluleGlissante(pilule: RefObject<HTMLUListElement | null>, colonneCourante: number, actions: ActionsPilule) {
  const colonneRef = useRef(colonneCourante)
  useEffect(() => {
    colonneRef.current = colonneCourante
  }, [colonneCourante])

  useEffect(() => {
    const ul = pilule.current
    if (!ul) return
    const g: { depart: { x: number; colonne: number } | null; actif: boolean; minuteur: number | null } = { depart: null, actif: false, minuteur: null }
    const racine = document.documentElement
    const progressionPlus = (p: number) => Math.max(0, Math.min(1, p - (NB_ONGLETS - 1)))
    const largeurColonne = () => (ul.getBoundingClientRect().width - 12) / 5 // px-1.5 de chaque côté
    const position = (x: number, d: { x: number; colonne: number }) => Math.max(0, Math.min(4, d.colonne + (x - d.x) / largeurColonne()))

    const onMove = (e: TouchEvent) => {
      const d = g.depart
      if (!d) return
      const x = e.touches[0].clientX
      if (!g.actif) {
        if (Math.abs(x - d.x) < 6) return
        g.actif = true
        if (g.minuteur !== null) window.clearTimeout(g.minuteur)
        ul.classList.add('pilule-glisse')
        annoncerPilule({ phase: 'debut' })
        racine.classList.remove('feuille-retour')
        racine.style.setProperty('--feuille-progression', '0')
        actions.debutApercuPlus()
      }
      if (e.cancelable) e.preventDefault() // ni défilement, ni clic après le geste
      // Seul le déplacement horizontal compte : monter ou descendre le doigt ne change rien.
      const p = position(x, d)
      viserBulle(p, 'suivi')
      annoncerPilule({ phase: 'mouvement', position: p })
      // Entre la dernière page et « Plus », la feuille monte au rythme de la bulle.
      racine.style.setProperty('--feuille-progression', progressionPlus(p).toFixed(3))
    }
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      g.depart = { x: e.touches[0].clientX, colonne: Math.max(0, colonneRef.current) }
      g.actif = false
      ul.addEventListener('touchmove', onMove, { passive: false })
    }
    const finir = (e: TouchEvent | null) => {
      ul.removeEventListener('touchmove', onMove)
      const d = g.depart
      g.depart = null
      if (!d || !g.actif) return
      g.actif = false
      const x = e?.changedTouches[0]?.clientX
      const colonne = x === undefined ? d.colonne : Math.round(position(x, d))
      // La bulle se pose sur la colonne (ressort libre) ; la scène fixe la page correspondante.
      viserBulle(colonne, 'libre')
      if (colonne === COLONNE_PLUS) {
        // La feuille est déjà levée : elle reste, sans ré-animer.
        actions.ouvrirPlus()
        actions.finApercuPlus()
        racine.style.removeProperty('--feuille-progression')
        annoncerPilule({ phase: 'annule' })
      } else {
        // La feuille, si elle s'était entrouverte, redescend en douceur.
        racine.classList.add('feuille-retour')
        racine.style.setProperty('--feuille-progression', '0')
        annoncerPilule({ phase: 'fin', colonne })
      }
      g.minuteur = window.setTimeout(() => {
        ul.classList.remove('pilule-glisse')
        racine.classList.remove('feuille-retour')
        racine.style.removeProperty('--feuille-progression')
        if (colonne !== COLONNE_PLUS) actions.finApercuPlus()
        g.minuteur = null
      }, 400)
    }
    const onEnd = (e: TouchEvent) => finir(e)
    const onCancel = () => finir(null)

    ul.addEventListener('touchstart', onStart, { passive: true })
    ul.addEventListener('touchend', onEnd, { passive: true })
    ul.addEventListener('touchcancel', onCancel, { passive: true })
    return () => {
      ul.removeEventListener('touchstart', onStart)
      ul.removeEventListener('touchend', onEnd)
      ul.removeEventListener('touchcancel', onCancel)
      ul.removeEventListener('touchmove', onMove)
      if (g.minuteur !== null) window.clearTimeout(g.minuteur)
    }
  }, [pilule, actions])
}

