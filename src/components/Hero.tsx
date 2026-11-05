import type { Config } from '../lib/config'
import { fmtDate } from '../lib/format'

export default function Hero({ config }: { config: Config }) {
  return (
    <header className="bg-navy text-white">
      {!config.donneesVerifiees && (
        <div className="bg-gold text-navy-deep text-sm font-medium text-center px-4 py-2">
          Chiffres en cours de vérification : les résultats sont provisoires.
        </div>
      )}
      <div className="mx-auto w-full max-w-3xl px-4 pt-12 pb-14 sm:pt-20 sm:pb-20">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
          <span aria-hidden="true">✈︎</span> Mis à jour le {fmtDate(config.dateMiseAJour)}
        </p>
        <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          {config.site.accroche}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl">{config.site.sousTitre}</p>
        <a
          href="#simulateur"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 text-base font-semibold text-navy-deep shadow-lg shadow-black/20 transition hover:brightness-105 active:scale-[0.98]"
        >
          Lancer la simulation
        </a>
      </div>
    </header>
  )
}
