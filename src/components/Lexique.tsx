import type { Config } from '../lib/config'
import Section from './Section'

export default function Lexique({ config }: { config: Config }) {
  const l = config.lexique
  return (
    <Section id="lexique" titre={l.titre} sousTitre={l.intro}>
      <dl className="grid gap-3 sm:grid-cols-2">
        {l.termes.map((t) => (
          <div key={t.terme} className="rounded-2xl border border-slate-200 bg-white p-4">
            <dt className="font-bold text-slate-900">{t.terme}</dt>
            <dd className="mt-1 text-sm text-slate-600">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
