import type { Config } from '../lib/config'
import Section from './Section'

export default function Transparence({ config }: { config: Config }) {
  const t = config.transparence
  return (
    <Section id="transparence" titre={t.titre}>
      <div className="rounded-2xl bg-white p-5 text-slate-700">
        <p>{t.texte}</p>
        <p className="mt-4 text-sm text-slate-500">{t.mentionIndependance}</p>
      </div>
    </Section>
  )
}
