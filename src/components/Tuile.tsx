import type { ReactNode } from 'react'

export type CouleurTuile = 'bleu' | 'ciel' | 'violet' | 'vert' | 'or' | 'rose' | 'argent' | 'platine'

/** Tuile d'icône arrondie en dégradé, à la manière des icônes d'apps iOS. */
export default function Tuile({ couleur = 'bleu', children, taille = 'md', className = '' }: { couleur?: CouleurTuile; children: ReactNode; taille?: 'sm' | 'md' | 'lg'; className?: string }) {
  const tailles = { sm: 'h-7 w-7 rounded-lg text-[14px]', md: 'h-10 w-10 rounded-xl text-[20px]', lg: 'h-14 w-14 rounded-2xl text-[28px]' }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center text-white shadow-sm degrade-${couleur} ${tailles[taille]} ${className}`}
    >
      {children}
    </span>
  )
}
