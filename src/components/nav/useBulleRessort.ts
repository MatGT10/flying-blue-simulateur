import { useEffect, useRef, type RefObject } from 'react'
import { COLONNE_PLUS } from '../../lib/pages'
import { ecouterBulle, viserBulle, type ModeBulle } from '../../lib/pilule'

/**
 * Physique de la bulle d'onglet. Sa position n'est pas une transition CSS mais un ressort calculé à
 * chaque image : elle suit sa cible avec un léger retard, s'étire dans le sens du mouvement et
 * dépasse un peu avant de se poser. Elle écrit sur la pilule les variables lues par le CSS :
 * --bulle-x (colonne), --bulle-sx / --bulle-sy (étirement), --bulle-v (vitesse 0 à 1), --bulle-dir
 * (direction -1 à 1). La cible vient de la page courante, du doigt sur la pilule, ou de la scène
 * pendant un balayage (src/lib/pilule.ts).
 */
export function useBulleRessort(pilule: RefObject<HTMLUListElement | null>, colonne: number) {
  const colonneRef = useRef(colonne)
  useEffect(() => {
    colonneRef.current = colonne
    // La page a changé (onglet touché, feuille Plus) : la bulle rejoint sa colonne d'elle-même.
    if (colonne >= 0) viserBulle(colonne, 'libre')
  }, [colonne])

  useEffect(() => {
    const ul = pilule.current
    if (!ul) return
    const etat = { x: Math.max(0, colonneRef.current), v: 0, cible: Math.max(0, colonneRef.current), mode: 'libre' as ModeBulle, image: null as number | null, t: 0 }
    const ecrire = () => {
      const vitesse = Math.min(1, Math.abs(etat.v) / 5) // 5 colonnes par seconde = vitesse pleine
      const signe = Math.max(-1, Math.min(1, etat.v / 5))
      ul.style.setProperty('--bulle-x', etat.x.toFixed(4))
      ul.style.setProperty('--bulle-sx', (1 + 0.22 * vitesse).toFixed(3))
      ul.style.setProperty('--bulle-sy', (1 - 0.09 * vitesse).toFixed(3))
      ul.style.setProperty('--bulle-v', vitesse.toFixed(3))
      ul.style.setProperty('--bulle-dir', signe.toFixed(3))
    }
    ecrire()
    const pas = (maintenant: number) => {
      const dt = Math.min(0.032, (maintenant - etat.t) / 1000 || 0.016)
      etat.t = maintenant
      // Ressort amorti : ferme sous le doigt, plus souple quand elle se pose (léger dépassement).
      const k = etat.mode === 'suivi' ? 520 : 190
      const zeta = etat.mode === 'suivi' ? 0.9 : 0.64
      const c = 2 * Math.sqrt(k) * zeta
      const a = k * (etat.cible - etat.x) - c * etat.v
      etat.v += a * dt
      etat.x += etat.v * dt
      // La bulle reste dans la pilule : au bord, elle s'arrête net, pas de dépassement vers l'extérieur.
      if (etat.x < 0) {
        etat.x = 0
        etat.v = Math.max(0, etat.v)
      } else if (etat.x > COLONNE_PLUS) {
        etat.x = COLONNE_PLUS
        etat.v = Math.min(0, etat.v)
      }
      if (Math.abs(etat.cible - etat.x) < 0.0015 && Math.abs(etat.v) < 0.01) {
        etat.x = etat.cible
        etat.v = 0
        ecrire()
        etat.image = null
        return
      }
      ecrire()
      etat.image = window.requestAnimationFrame(pas)
    }
    const lancer = () => {
      if (etat.image !== null) return
      etat.t = performance.now()
      etat.image = window.requestAnimationFrame(pas)
    }
    const arreter = ecouterBulle((cible, mode) => {
      etat.cible = cible
      etat.mode = mode
      lancer()
    })
    return () => {
      arreter()
      if (etat.image !== null) window.cancelAnimationFrame(etat.image)
    }
  }, [pilule])
}

