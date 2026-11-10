import type { Config } from '../lib/config'
import Section from './Section'

export default function FAQ({ config }: { config: Config }) {
  return (
    <Section id="faq" titre="Questions fréquentes" fond="blanc">
      <div className="divide-y divide-ios-sep/60 rounded-2xl bg-white">
        {config.faq.map((item) => (
          <details key={item.question} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium text-ios-label">
              {item.question}
              <span aria-hidden="true" className="text-ios-sep transition group-open:rotate-90">›</span>
            </summary>
            <p className="mt-3 text-slate-600">{item.reponse}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
