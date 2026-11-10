import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import { fmtDate, fmtEntier } from '../lib/format'

export default function Hero({ config }: { config: Config }) {
  const vedette = config.cartes.find((c) => c.id === config.offreDuMoment.carteMiseEnAvant)
  return (
    <header className="hero-degrade text-white">
      {!config.donneesVerifiees && (
        <div className="bg-ios-yellow text-ios-label text-sm font-medium text-center px-4 py-2">
          Chiffres en cours de vérification : les résultats sont provisoires.
        </div>
      )}
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-8 sm:pt-14 sm:pb-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
          ✈︎ Mis à jour le {fmtDate(config.dateMiseAJour)}
        </p>
        <h1 className="mt-4 text-[34px] leading-[1.08] sm:text-5xl font-bold tracking-tight">{config.site.accroche}</h1>
        <p className="mt-4 text-[17px] text-white/85 max-w-xl">{config.site.sousTitre}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="#simulateur"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-[17px] font-semibold text-ios-blue shadow-lg shadow-black/10 transition active:opacity-80"
          >
            Lancer la simulation
          </a>
          {config.offreDuMoment.actif && vedette?.offre && (
            <Link
              to="/offre"
              className="inline-flex items-center justify-center rounded-2xl bg-white/15 px-6 py-3.5 text-[17px] font-semibold text-white ring-1 ring-white/30 backdrop-blur transition active:opacity-80"
            >
              {vedette.courte} : {fmtEntier(vedette.offre.milesBienvenue)} miles offerts
              {vedette.offre.premiereAnneeOfferte ? ' + 1ère année gratuite' : ''}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
