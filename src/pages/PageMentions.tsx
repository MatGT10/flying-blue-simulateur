import type { Config } from '../lib/config'
import { fmtDate } from '../lib/format'
import Section from '../components/Section'

export default function PageMentions({ config }: { config: Config }) {
  const m = config.mentions
  const blocs = [
    ['Éditeur', m.editeur],
    ['Hébergement', m.hebergeur],
    ['Indépendance et limites', m.independance],
    ['Liens de parrainage', m.parrainage],
    ['Données personnelles', m.donnees],
  ]
  return (
    <Section titre={m.titre} sousTitre={`Données au ${fmtDate(config.dateMiseAJour)}, version ${__VERSION__}.`}>
      <dl className="divide-y divide-ios-sep/60 rounded-2xl bg-carte">
        {blocs.map(([titre, texte]) => (
          <div key={titre} className="px-5 py-4">
            <dt className="font-bold text-ios-label">{titre}</dt>
            <dd className="mt-1 text-[15px] text-slate-600 selectionnable">{texte}</dd>
          </div>
        ))}
        {m.contact && (
          <div className="px-5 py-4">
            <dt className="font-bold text-ios-label">Contact</dt>
            <dd className="mt-1 text-[15px] text-slate-600 selectionnable">{m.contact}</dd>
          </div>
        )}
      </dl>
    </Section>
  )
}
