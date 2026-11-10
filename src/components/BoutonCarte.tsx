import type { Carte } from '../lib/config'

interface Props {
  carte: Carte
  /** Apparence : 'plein' (bouton principal), 'contour' (secondaire), 'lien' (texte souligné). */
  variante?: 'plein' | 'contour' | 'lien' | 'blanc'
  className?: string
}

/**
 * Bouton d'action d'une carte : lien de parrainage s'il existe (annoncé comme tel),
 * sinon page officielle American Express. Rien si aucun lien.
 */
export default function BoutonCarte({ carte, variante = 'plein', className = '' }: Props) {
  const parrainage = !!carte.lienParrainage
  const href = carte.lienParrainage ?? carte.lienOfficiel
  if (!href) return null
  const styles = {
    plein: 'inline-flex items-center justify-center rounded-2xl bg-ios-blue px-5 py-3 text-[15px] font-semibold text-white transition active:opacity-80',
    contour: 'inline-flex items-center justify-center rounded-2xl bg-ios-fill px-5 py-3 text-[15px] font-semibold text-ios-blue transition active:opacity-80',
    lien: 'inline-block text-sm font-medium underline underline-offset-2',
    blanc: 'inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-[15px] font-semibold text-ios-blue shadow-lg shadow-black/10 transition active:opacity-80',
  }
  return (
    <a
      href={href}
      target="_blank"
      rel={parrainage ? 'sponsored noopener' : 'noopener'}
      className={`${styles[variante]} ${className}`}
    >
      {parrainage ? `Obtenir la ${carte.courte} avec le parrainage` : `Voir la ${carte.courte} sur American Express`}
      <span className="sr-only"> ({parrainage ? 'lien de parrainage, ' : ''}nouvel onglet)</span>
    </a>
  )
}
