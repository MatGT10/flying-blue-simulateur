import type { Config } from '../lib/config'
import { fmtDate } from '../lib/format'

export default function Offre({ config }: { config: Config }) {
  const o = config.offreDuMoment
  if (!o.actif) return null
  return (
    <section id="offre" className="bg-navy py-12 sm:py-16 text-white">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="rounded-3xl bg-gradient-to-br from-navy-deep to-sky/40 p-6 sm:p-8 ring-1 ring-white/10">
          <p className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy-deep">
            {o.etiquette}
          </p>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">{o.titre}</h2>
          <p className="mt-3 text-blue-100">{o.description}</p>
          {o.dateFin && <p className="mt-3 text-sm text-blue-200">Valable jusqu’au {fmtDate(o.dateFin)}.</p>}
          <a
            href={o.lienParrainage}
            target="_blank"
            rel="sponsored noopener"
            className="mt-6 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-gold px-6 py-3 font-semibold text-navy-deep transition hover:brightness-105 active:scale-[0.98]"
          >
            {o.ctaLabel}
            <span className="sr-only"> (lien de parrainage, nouvel onglet)</span>
          </a>
          <p className="mt-3 text-xs text-blue-200">Lien de parrainage, voir la section Transparence.</p>
        </div>
      </div>
    </section>
  )
}
