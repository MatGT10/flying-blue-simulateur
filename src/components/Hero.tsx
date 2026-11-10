import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import { fmtDate, fmtEntier } from '../lib/format'

export default function Hero({ config }: { config: Config }) {
  const vedette = config.cartes.find((c) => c.id === config.offreDuMoment.carteMiseEnAvant)
  return (
    <header className="bg-ios-bg">
      {!config.donneesVerifiees && (
        <div className="bg-ios-yellow text-ios-label text-sm font-medium text-center px-4 py-2">
          Chiffres en cours de vérification : les résultats sont provisoires.
        </div>
      )}
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-6 sm:pt-14 sm:pb-10">
        <p className="text-[13px] font-medium uppercase tracking-wide text-ios-gray">
          Mis à jour le {fmtDate(config.dateMiseAJour)}
        </p>
        <h1 className="mt-2 text-[34px] leading-[1.1] sm:text-5xl font-bold tracking-tight text-ios-label">
          {config.site.accroche}
        </h1>
        <p className="mt-4 text-[17px] text-slate-600 max-w-xl">{config.site.sousTitre}</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="#simulateur"
            className="inline-flex items-center justify-center rounded-2xl bg-ios-blue px-6 py-3.5 text-[17px] font-semibold text-white transition active:opacity-80"
          >
            Lancer la simulation
          </a>
          {config.offreDuMoment.actif && vedette?.offre && (
            <Link
              to="/offre"
              className="inline-flex items-center justify-center rounded-2xl bg-ios-fill px-6 py-3.5 text-[17px] font-semibold text-ios-blue transition active:opacity-80"
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
