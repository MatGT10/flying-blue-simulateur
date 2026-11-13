import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { NB_ONGLETS, pagesMenu } from '../../lib/pages'

const AUTRES = pagesMenu.slice(NB_ONGLETS)

type EtatFeuille = 'fermee' | 'apercu' | 'ouverte' | 'sortie'

interface Props {
  ouverte: boolean
  /** Vrai pendant qu'on tire la bulle vers « Plus » : la feuille monte au rythme de --feuille-progression (0 à 1). */
  apercu: boolean
  onFermer: () => void
}

/**
 * Feuille « Plus » : bulle de verre qui monte, se ferme en la tirant vers le bas (ou en touchant le fond).
 * Elle peut aussi s'entrouvrir progressivement pendant que la bulle d'onglet glisse vers « Plus »
 * (état « apercu »), puis rester ouverte sans ré-animer si on relâche dessus.
 */
export default function FeuillePlus({ ouverte, apercu, onFermer }: Props) {
  const [etat, setEtat] = useState<{ nom: EtatFeuille; sansAnimation: boolean }>({ nom: 'fermee', sansAnimation: false })
  // L'état dérive des props pendant le rendu : ouverture immédiate, fermeture après l'animation de sortie.
  if (ouverte && etat.nom !== 'ouverte') setEtat({ nom: 'ouverte', sansAnimation: etat.nom === 'apercu' })
  else if (!ouverte && etat.nom === 'ouverte') setEtat({ nom: 'sortie', sansAnimation: false })
  else if (!ouverte && apercu && etat.nom === 'fermee') setEtat({ nom: 'apercu', sansAnimation: false })
  else if (!ouverte && !apercu && etat.nom === 'apercu') setEtat({ nom: 'fermee', sansAnimation: false })
  useEffect(() => {
    if (etat.nom !== 'sortie') return
    const id = window.setTimeout(() => setEtat({ nom: 'fermee', sansAnimation: false }), 260)
    return () => window.clearTimeout(id)
  }, [etat.nom])

  // Tirage vers le bas piloté directement dans le DOM : aucun re-rendu pendant le geste.
  const feuille = useRef<HTMLDivElement>(null)
  const dialogue = useRef<HTMLDivElement>(null)
  const departY = useRef<number | null>(null)
  const glisse = useRef(0)

  // Tant que la feuille est ouverte, aucun mouvement du doigt ne doit faire défiler ou rebondir la page derrière.
  useEffect(() => {
    const el = dialogue.current
    if (!el) return
    const bloquer = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault()
    }
    el.addEventListener('touchmove', bloquer, { passive: false })
    return () => el.removeEventListener('touchmove', bloquer)
  }, [etat.nom])

  if (etat.nom === 'fermee') return null
  const enApercu = etat.nom === 'apercu'

  const onStart = (e: React.TouchEvent) => {
    departY.current = e.touches[0].clientY
    glisse.current = 0
  }
  const onMove = (e: React.TouchEvent) => {
    if (departY.current === null) return
    const dy = Math.max(0, e.touches[0].clientY - departY.current)
    glisse.current = dy
    const el = feuille.current
    if (el) {
      el.style.transition = 'none'
      el.style.transform = `translateY(${dy}px)`
    }
  }
  const onEnd = () => {
    const d = glisse.current
    departY.current = null
    glisse.current = 0
    const el = feuille.current
    if (!el) return
    el.style.transform = ''
    if (d > 80) {
      // L'animation de sortie repart de la position où le doigt a lâché.
      el.style.setProperty('--feuille-depart', `${d}px`)
      onFermer()
    } else {
      el.style.transition = 'transform 200ms ease-out'
    }
  }

  const classeFeuille =
    etat.nom === 'sortie' ? 'feuille-sortie' : enApercu ? 'feuille-apercu' : etat.sansAnimation ? 'feuille-posee' : 'feuille-entree'

  return (
    <div
      ref={dialogue}
      className="fixed inset-0 z-30 sm:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Plus de pages"
      style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/25 ${enApercu ? 'feuille-apercu-fond' : `transition-opacity duration-300 ${etat.nom === 'sortie' ? 'opacity-0' : 'opacity-100'}`}`}
        aria-label="Fermer"
        onClick={onFermer}
      />
      <div
        ref={feuille}
        className={`glass absolute inset-x-3 bottom-3 rounded-[28px] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] ${classeFeuille}`}
        onTouchStart={enApercu ? undefined : onStart}
        onTouchMove={enApercu ? undefined : onMove}
        onTouchEnd={enApercu ? undefined : onEnd}
        onTouchCancel={enApercu ? undefined : onEnd}
        data-sans-geste
      >
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ios-label/20" aria-hidden="true" />
        <ul>
          {AUTRES.map((p, i) => (
            <li key={p.to} className={i > 0 ? 'border-t border-ios-label/10' : ''}>
              <NavLink
                to={p.to}
                onClick={onFermer}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3.5 text-[17px] ${isActive ? 'text-ios-blue' : 'text-ios-label'}`
                }
              >
                <span className="flex-1">{p.label}</span>
                <span className="text-ios-gray" aria-hidden="true">›</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
