import type { ReactNode } from 'react'
import Tuile, { type CouleurTuile } from './Tuile'

interface Props {
  id?: string
  titre: string
  sousTitre?: string
  children: ReactNode
  /** Conservé pour compatibilité : en style iOS, toutes les sections partagent le fond groupé. */
  fond?: 'clair' | 'blanc' | 'navy'
  /** Icône de la tuile à gauche du titre (emoji ou glyphe). */
  icone?: ReactNode
  couleur?: CouleurTuile
}

export default function Section({ id, titre, sousTitre, children, icone, couleur = 'bleu' }: Props) {
  return (
    <section id={id} className="py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="flex items-start gap-3">
          {icone && <Tuile couleur={couleur} className="mt-1">{icone}</Tuile>}
          <div className="min-w-0">
            <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-ios-label">{titre}</h2>
            {sousTitre && <p className="mt-2 text-[15px] text-slate-600">{sousTitre}</p>}
          </div>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  )
}
