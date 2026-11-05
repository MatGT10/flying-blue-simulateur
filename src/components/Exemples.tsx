import { useEffect, useState } from 'react'
import type { Config } from '../lib/config'
import { moisPourAtteindre, type Simulation } from '../lib/calcul'
import { fmtEntier, fmtEuros } from '../lib/format'
import Section from './Section'

interface Props {
  config: Config
  simulation: Simulation
}

export default function Exemples({ config, simulation }: Props) {
  const cartesAvecMiles = simulation.resultats.filter((r) => r.milesTotal > 0)
  const [carteId, setCarteId] = useState<string | null>(null)

  // Suit la meilleure carte tant que l'utilisateur n'a pas choisi lui-même.
  const parDefaut =
    simulation.meilleure.milesTotal > 0 ? simulation.meilleure.carte.id : cartesAvecMiles[0]?.carte.id ?? null
  const selection = cartesAvecMiles.find((r) => r.carte.id === carteId) ?? cartesAvecMiles.find((r) => r.carte.id === parDefaut)

  useEffect(() => {
    if (carteId && !cartesAvecMiles.some((r) => r.carte.id === carteId)) setCarteId(null)
  }, [carteId, cartesAvecMiles])

  return (
    <Section id="exemples" titre="Que faire avec vos miles ?" sousTitre={config.exemples.intro}>
      {cartesAvecMiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cartesAvecMiles.map((r) => {
            const actif = selection?.carte.id === r.carte.id
            return (
              <button
                key={r.carte.id}
                type="button"
                onClick={() => setCarteId(r.carte.id)}
                aria-pressed={actif}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  actif ? 'bg-navy text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {r.carte.courte}
              </button>
            )
          })}
        </div>
      )}

      <ul className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {config.exemples.liste.map((ex) => {
          const mois = selection ? moisPourAtteindre(ex.miles, selection.milesTotal) : null
          return (
            <li key={ex.titre} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{ex.titre}</p>
                <p className="text-sm text-slate-500">
                  {fmtEntier(ex.miles)} miles
                  {ex.taxesApprox !== null && <> + env. {fmtEuros(ex.taxesApprox)} de taxes</>}
                  {ex.promo && <span className="ml-2 rounded bg-sky-soft px-1.5 py-0.5 text-xs text-navy">tarif promo</span>}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {mois === null ? (
                  <span className="text-sm text-slate-400">—</span>
                ) : (
                  <>
                    <p className="text-lg font-bold text-navy">{mois <= 12 ? `${mois} mois` : `${(mois / 12).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans`}</p>
                    <p className="text-xs text-slate-500">avec la {selection?.carte.courte}</p>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {!selection && (
        <p className="mt-3 text-sm text-slate-500">
          Saisissez des dépenses ci-dessus pour voir en combien de temps vous atteignez chaque prime.
        </p>
      )}
    </Section>
  )
}
