import type { Config } from '../lib/config'
import Section from './Section'

export default function FAQ({ config }: { config: Config }) {
  return (
    <Section id="faq" titre="Questions fréquentes" fond="blanc">
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
        {config.faq.map((item) => (
          <details key={item.question} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
              {item.question}
              <span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-slate-600">{item.reponse}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
