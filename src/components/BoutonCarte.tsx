import type { Carte } from '../lib/config'

interface Props {
  carte: Carte
  /** Apparence : 'plein' (bouton principal), 'contour' (secondaire), 'lien' (texte souligné). */
  variante?: 'plein' | 'contour' | 'lien'
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
    plein: 'inline-flex items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-semibold text-navy-deep transition hover:brightness-105 active:scale-[0.98]',
    contour: 'inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:bg-slate-50 active:scale-[0.98]',
    lien: 'inline-block text-sm font-medium underline underline-offset-2',
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
