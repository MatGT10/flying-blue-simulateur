export type NomIcone =
  | 'avion' | 'carte' | 'cadeau' | 'calculatrice' | 'livre' | 'livres' | 'boussole' | 'utilisateurs'
  | 'ampoule' | 'graphique' | 'tendance' | 'telephone' | 'flamme' | 'etoile' | 'question' | 'loupe'
  | 'globe' | 'voiture' | 'hotel' | 'billet' | 'sac' | 'crayon' | 'trophee' | 'chrono' | 'euro' | 'point'

/** Icônes au trait, style symboles système : un seul tracé par icône, couleur héritée. */
const TRACES: Record<NomIcone, string> = {
  avion: 'M3 13l7 1 4 7 2-1-1-7 5-3a2 2 0 0 0-2-3l-5 2-6-4-2 1 4 5-6 2z',
  carte: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M7 15h4',
  cadeau: 'M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9c-2-4-6-4-6-1s4 1 6 1zm0 0c2-4 6-4 6-1s-4 1-6 1z',
  calculatrice: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM8 7h8M8 12h2M12 12h2M16 12h.01M8 16h2M12 16h2M16 16h.01',
  livre: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19a2 2 0 0 1 2-2h13M8 7h7',
  livres: 'M4 4h4v16H4zM10 4h4v16h-4zM16 6l4-1 3 15-4 1z',
  boussole: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  utilisateurs: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  ampoule: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.3 1 2.5h6c0-1.2.3-1.9 1-2.5A6 6 0 0 0 12 3z',
  graphique: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  tendance: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  telephone: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2',
  flamme: 'M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-8 0 4-4 6-4 11a7 7 0 0 0 7 8z',
  etoile: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z',
  question: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01',
  loupe: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.5-4.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  voiture: 'M5 16l1.5-5h11L19 16M3 16h18v3H3zM7 19v2M17 19v2M7 16h.01M17 16h.01',
  hotel: 'M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3',
  billet: 'M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4zM12 7v2M12 11v2M12 15v2',
  sac: 'M6 8h12l1 13H5zM9 8V6a3 3 0 0 1 6 0v2',
  crayon: 'M4 20h4l10-10-4-4L4 16zM13 7l4 4',
  trophee: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M10 17h4v4h-4z',
  chrono: 'M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 10v4l2 2M9 2h6M12 2v4',
  euro: 'M18 6a7 7 0 1 0 0 12M4 10h9M4 14h9',
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
