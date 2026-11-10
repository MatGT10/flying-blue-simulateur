import { useMemo, useState } from 'react'
import type { Config } from '../../lib/config'
import { moisPourAtteindreAvecBonus, type Simulation } from '../../lib/calcul'
import { fmtEntier, fmtEuros, fmtMiles } from '../../lib/format'
import BoutonVerifier from '../BoutonVerifier'

interface Props {
  config: Config
  simulation: Simulation
}

function libelleDelai(mois: number): string {
  if (mois === 0) return 'dès l’ouverture'
  if (mois === 1) return 'dans 1 mois'
  if (mois < 24) return `dans ${mois} mois`
  const ans = mois / 12
  return `dans ${ans.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans`
}

function dateDans(mois: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + mois)
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export default function ProchainVol({ config, simulation }: Props) {
  const cartes = useMemo(() => simulation.resultats.filter((r) => r.milesTotal > 0), [simulation])
  const [carteId, setCarteId] = useState<string | null>(null)
  const parDefaut = simulation.meilleure.milesTotal > 0 ? simulation.meilleure.carte.id : cartes[0]?.carte.id ?? null
  // Une carte choisie puis disparue (plus de miles) retombe simplement sur la carte par défaut.
  const selection = cartes.find((r) => r.carte.id === carteId) ?? cartes.find((r) => r.carte.id === parDefaut)
  const destinations = useMemo(() => [...config.exemples.liste].sort((a, b) => a.miles - b.miles), [config])
  const premiereAnnee = simulation.mode === 'premiereAnnee'

  return (
    <div className="mt-10 rounded-2xl bg-carte p-5 sm:p-6">
      <h3 className="text-xl font-bold tracking-tight">{config.prochainVol.titre}</h3>
      <p className="mt-1 text-sm text-slate-600">{config.prochainVol.intro}</p>

      {cartes.length === 0 ? (
        <p className="mt-4 rounded-xl bg-carte px-4 py-3 text-sm text-slate-600">
          Saisissez des dépenses, ou choisissez le mode « 1ère année », pour voir vos délais.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {cartes.map((r) => {
              const actif = selection?.carte.id === r.carte.id
              return (
                <button
                  key={r.carte.id}
                  type="button"
                  onClick={() => setCarteId(r.carte.id)}
                  aria-pressed={actif}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    actif ? 'bg-ios-blue text-white' : 'bg-ios-fill text-ios-label'
                  }`}
                >
                  {r.carte.courte}
                </button>
              )
            })}
          </div>

          {selection && (
            <p className="mt-4 text-sm text-slate-700">
              Avec <span className="font-semibold">{fmtEuros(simulation.depenseMensuelleTotale)} par mois</span> de dépenses,
              la {selection.carte.courte} vous rapporte{' '}
              <span className="font-semibold">{fmtMiles(selection.milesDepenses)} par an</span>
              {premiereAnnee && selection.milesBienvenue > 0 && (
                <>, plus <span className="font-semibold">{fmtMiles(selection.milesBienvenue)}</span> de bienvenue</>
              )}
              .
            </p>
          )}

          <ul className="mt-4 divide-y divide-ios-sep/60 rounded-2xl bg-carte">
            {destinations.map((d) => {
              const mois = selection
                ? moisPourAtteindreAvecBonus(d.miles, selection.milesBienvenue, selection.milesDepenses)
                : null
              return (
                <li key={d.titre} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{d.titre}</p>
                    <p className="text-sm text-slate-500">
                      {fmtEntier(d.miles)} miles
                      {' '}+ taxes d’aéroport
                      {d.promo && <span className="ml-2 rounded bg-sky-soft px-1.5 py-0.5 text-xs text-navy">tarif promo</span>}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {mois === null ? (
                      <span className="text-sm text-slate-400">—</span>
                    ) : (
                      <>
                        <p className={`font-bold ${mois === 0 ? 'text-emerald-700' : 'text-navy'}`}>{libelleDelai(mois)}</p>
                        {mois > 0 && <p className="text-xs text-slate-500">vers {dateDans(mois)}</p>}
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <BoutonVerifier config={config} />
            <p className="text-xs text-slate-500">{config.exemples.intro}</p>
          </div>
        </>
      )}
    </div>
  )
}
