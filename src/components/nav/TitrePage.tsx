import { useState } from 'react'
import { pages, pagesMenu, sensEntre, type Sens } from '../../lib/pages'

/**
 * Titre de la page dans le bandeau mobile. Pendant un balayage, les titres des pages voisines sont
 * posés de part et d'autre et la piste suit le doigt (variable --balayage-progression posée par la
 * scène). À l'arrivée par un onglet, le nouveau titre glisse depuis le côté correspondant.
 */
export default function TitrePage({ pathname }: { pathname: string }) {
  const [etat, setEtat] = useState<{ path: string; anim: Sens | 'aucune' }>({ path: pathname, anim: 'aucune' })
  if (etat.path !== pathname) {
    // Arrivée par balayage : le titre a déjà glissé avec la page, pas d'animation.
    const parBalayage = document.documentElement.classList.contains('balayage')
    setEtat({ path: pathname, anim: parBalayage ? 'aucune' : sensEntre(etat.path, pathname) })
  }
  const courante = pages.find((p) => p.to === pathname) ?? pages[0]
  const i = pagesMenu.findIndex((p) => p.to === pathname)
  const precedente = i > 0 ? pagesMenu[i - 1] : null
  const suivante = i >= 0 ? pagesMenu[i + 1] ?? null : null
  return (
    <span className="titre-page" aria-hidden={false}>
      <span className="titre-piste">
        {precedente && <span className="titre-voisin titre-voisin-precedent" style={{ transform: 'translateX(-70%)' }} aria-hidden="true">{precedente.label}</span>}
        <span key={pathname} className={`titre-courant ${etat.anim !== 'aucune' ? `titre-entre-${etat.anim}` : ''}`}>{courante.label}</span>
        {suivante && <span className="titre-voisin titre-voisin-suivant" style={{ transform: 'translateX(70%)' }} aria-hidden="true">{suivante.label}</span>}
      </span>
    </span>
  )
}

