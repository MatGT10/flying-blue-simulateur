import type { ResultatCarte } from '../../lib/calcul'
import type { Accent } from '../../lib/config'
import { fmtEuros, fmtGain, fmtMiles } from '../../lib/format'
import BoutonCarte from '../BoutonCarte'

interface Props {
  resultat: ResultatCarte
  meilleure: boolean
}

const accents: Record<Accent, { bande: string; badge: string }> = {
  neutre: { bande: 'bg-slate-300', badge: 'bg-slate-100 text-slate-700' },
  argent: { bande: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700' },
  or: { bande: 'bg-gold', badge: 'bg-gold-soft text-amber-800' },
  platine: { bande: 'bg-navy', badge: 'bg-sky-soft text-navy' },
}

export default function CarteResultat({ resultat: r, meilleure }: Props) {
  const { carte } = r
  const a = accents[carte.accent] ?? accents.neutre
  const ton =
    r.gainNetMedian > 0
      ? { fond: "bg-emerald-50", titre: "text-emerald-700", valeur: "text-emerald-800" }
      : r.gainNetMedian < 0
        ? { fond: "bg-rose-50", titre: "text-rose-700", valeur: "text-rose-800" }
        : { fond: "bg-slate-100", titre: "text-slate-600", valeur: "text-slate-700" }
  const premiereAnnee = r.mode === 'premiereAnnee'
  const cotisationOfferte = premiereAnnee && carte.offre?.premiereAnneeOfferte && carte.cotisationAnnuelle > 0

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm ${
        meilleure ? 'border-sky ring-2 ring-sky/40' : 'border-slate-200'
      }`}
    >
      <div className={`h-1.5 ${a.bande}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{carte.nom}</h3>
              {carte.offre?.premiereAnneeOfferte && (
                <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                  1ère année offerte
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{carte.description}</p>
          </div>
          {meilleure && (
            <span className="shrink-0 rounded-full bg-sky px-2.5 py-1 text-xs font-semibold text-white">
              Meilleure option
            </span>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Miles par an</dt>
            <dd className="font-semibold text-slate-900">{fmtMiles(r.milesTotal)}</dd>
            {r.milesBienvenue > 0 && (
              <dd className="text-xs text-emerald-700">dont {fmtMiles(r.milesBienvenue)} de bienvenue</dd>
            )}
            {r.bienvenueNonAtteinte && carte.offre && (
              <dd className="text-xs text-amber-700">
                Bonus de {fmtMiles(carte.offre.milesBienvenue)} non atteint : il faut{' '}
                {fmtEuros(carte.offre.conditionDepense)} en {carte.offre.conditionDelaiMois} mois.
              </dd>
            )}
          </div>
          <div>
            <dt className="text-slate-500">Valeur estimée</dt>
            <dd className="font-semibold text-slate-900">
              {fmtEuros(r.valeurBasse)} à {fmtEuros(r.valeurHaute)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Cotisation</dt>
            <dd className="font-semibold text-slate-900">
              {r.cotisationOfferteParDepenses ? (
                <>
                  <span className="text-emerald-700">Offerte</span>{' '}
                  <span className="text-xs font-normal text-slate-500">
                    (dépenses ≥ {fmtEuros(carte.cotisationOfferteDes ?? 0)} / an)
                  </span>
                </>
              ) : cotisationOfferte ? (
                <>
                  <span className="text-emerald-700">Offerte</span>{' '}
                  <span className="text-xs font-normal text-slate-500">
                    ({fmtEuros(carte.cotisationAnnuelle)} dès l’année 2)
                  </span>
                </>
              ) : (
                fmtEuros(r.cotisation)
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Point mort</dt>
            <dd className="font-semibold text-slate-900">
              {r.pointMortMensuel === null ? (
                <span className="text-slate-400">—</span>
              ) : (
                <>
                  {fmtEuros(r.pointMortMensuel)}
                  <span className="text-xs font-normal text-slate-500"> / mois</span>
                </>
              )}
            </dd>
          </div>
        </dl>

        <div className={`mt-5 rounded-xl px-4 py-3 ${ton.fond}`}>
          <p className={`text-xs font-medium ${ton.titre}`}>
            Gain net {premiereAnnee ? 'la première année' : 'par an'}
          </p>
          <p className={`text-2xl font-extrabold ${ton.valeur}`}>
            {fmtGain(r.gainNetBas)} à {fmtGain(r.gainNetHaut)}
          </p>
        </div>

        <BoutonCarte carte={carte} variante={meilleure ? 'plein' : 'contour'} className="mt-4 w-full" />
      </div>
    </article>
  )
}
