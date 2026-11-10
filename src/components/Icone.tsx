export type NomIcone = 'avion' | 'cadeau' | 'calculatrice' | 'tendance' | 'question' | 'globe' | 'crayon' | 'ampoule' | 'point'

/** Icônes au trait, style symboles système : un seul tracé par icône, couleur héritée. Seules celles utilisées sont conservées. */
const TRACES: Record<NomIcone, string> = {
  avion: 'M3 13l7 1 4 7 2-1-1-7 5-3a2 2 0 0 0-2-3l-5 2-6-4-2 1 4 5-6 2z',
  cadeau: 'M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9c-2-4-6-4-6-1s4 1 6 1zm0 0c2-4 6-4 6-1s-4 1-6 1z',
  calculatrice: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8 12h2M12 12h2M16 12h.01M8 16h2M12 16h2M16 16h.01',
  tendance: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  question: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  crayon: 'M4 20h4l10-10-4-4L4 16zM13 7l4 4',
  ampoule: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.3 1 2.5h6c0-1.2.3-1.9 1-2.5A6 6 0 0 0 12 3z',
  point: 'M12 12h.01',
}

export default function Icone({ nom, className = 'h-5 w-5' }: { nom: NomIcone | string; className?: string }) {
  const d = TRACES[nom as NomIcone] ?? TRACES.point
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
