import { useState } from 'react'
import type { Config } from '../lib/config'
import { paliersParrainage } from '../lib/calcul'
import { fmtEntier, fmtEuros, fmtMiles } from '../lib/format'
import Section from './Section'
import BoutonCarte from './BoutonCarte'

export default function Parrainage({ config }: { config: Config }) {
  const cartes = config.cartes.filter((c) => c.offre && c.offre.milesBienvenue > 0)
  const defaut = cartes.find((c) => c.id === config.offreDuMoment.carteMiseEnAvant) ?? cartes[0]
  const [carteId, setCarteId] = useState(defaut?.id ?? '')
  const [filleuls, setFilleuls] = useState(0)

  const carte = cartes.find((c) => c.id === carteId) ?? defaut
  if (!carte || !carte.offre) return null

  const paliers = paliersParrainage(carte)
  const palier = paliers.find((p) => p.filleuls === filleuls) ?? paliers[0]
  const destinations = [...config.exemples.liste].sort((a, b) => a.miles - b.miles)
  const accessibles = destinations.filter((d) => d.miles <= palier.milesTotal)
  const prochaines = destinations.filter((d) => d.miles > palier.milesTotal).slice(0, 2)
  const parFilleul = carte.parrainage?.milesParFilleul ?? null

  return (
    <Section id="parrainage" titre={config.parrainage.titre} sousTitre={config.parrainage.intro} fond="blanc">
      {/* Choix de la carte */}
      <div className="flex flex-wrap gap-2">
        {cartes.map((c) => {
          const actif = c.id === carte.id
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                setCarteId(c.id)
                setFilleuls(0)
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                actif ? 'bg-navy text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {c.courte}
              {c.offre?.premiereAnneeOfferte && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    actif ? 'bg-gold text-navy-deep' : 'bg-gold-soft text-amber-800'
                  }`}
                >
                  1ère année offerte
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Paliers */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {paliers.map((p) => {
          const actif = p.filleuls === palier.filleuls
          return (
            <button
              key={p.filleuls}
              type="button"
              aria-pressed={actif}
              onClick={() => setFilleuls(p.filleuls)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                actif ? 'border-sky bg-sky-soft ring-2 ring-sky/40' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-medium text-slate-500">
                {p.filleuls === 0 ? 'Bienvenue seule' : `+ ${p.filleuls} ${p.filleuls > 1 ? 'parrainages' : 'parrainage'}`}
              </span>
              <span className="block text-lg font-bold text-navy">{fmtEntier(p.milesTotal)} miles</span>
            </button>
          )
        })}
      </div>

      {parFilleul === null && (
        <p className="mt-3 text-sm text-amber-800 bg-gold-soft rounded-xl px-4 py-3">
          Le gain par parrainage avec la {carte.courte} n’est pas encore renseigné : seuls les miles de bienvenue sont
          affichés.
        </p>
      )}

      {/* Résumé */}
      <div className="mt-6 rounded-2xl bg-navy px-5 py-4 text-white">
        <p className="text-sm text-blue-100">
          {palier.filleuls === 0
            ? `Avec les ${fmtEntier(carte.offre.milesBienvenue)} miles de bienvenue de la ${carte.courte}`
            : `Bienvenue + ${palier.filleuls} ${palier.filleuls > 1 ? 'amis parrainés' : 'ami parrainé'} (${fmtEntier(parFilleul ?? 0)} miles chacun)`}
        </p>
        <p className="text-2xl font-extrabold">
          {accessibles.length} {accessibles.length > 1 ? 'destinations accessibles' : 'destination accessible'}
        </p>
      </div>

      {/* Destinations */}
      <ul className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {accessibles.map((d) => (
          <li key={d.titre} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">
                <span className="mr-2 text-emerald-600" aria-hidden="true">✓</span>
                {d.titre}
              </p>
              <p className="text-sm text-slate-500">
                dès {fmtEntier(d.miles)} miles
                {d.taxesApprox !== null && <> + env. {fmtEuros(d.taxesApprox)} de taxes</>}
                {d.promo && <span className="ml-2 rounded bg-sky-soft px-1.5 py-0.5 text-xs text-navy">tarif promo</span>}
              </p>
            </div>
            <p className="shrink-0 text-sm text-emerald-700 font-medium">
              reste {fmtEntier(palier.milesTotal - d.miles)}
            </p>
          </li>
        ))}
        {prochaines.map((d) => (
          <li key={d.titre} className="flex items-center justify-between gap-4 px-5 py-4 opacity-60">
            <div className="min-w-0">
              <p className="font-semibold text-slate-700">{d.titre}</p>
              <p className="text-sm text-slate-500">dès {fmtEntier(d.miles)} miles</p>
            </div>
            <p className="shrink-0 text-sm text-slate-500">il manque {fmtEntier(d.miles - palier.milesTotal)}</p>
          </li>
        ))}
        {accessibles.length === 0 && prochaines.length === 0 && (
          <li className="px-5 py-4 text-sm text-slate-500">Aucune destination renseignée.</li>
        )}
      </ul>

      <p className="mt-4 text-xs text-slate-500">
        Prix « dès » constatés, hors taxes, en tarification dynamique. {config.parrainage.noteFilleul}
        {config.parrainage.plafondAnnuel && (
          <> Miles de parrainage plafonnés à {fmtMiles(config.parrainage.plafondAnnuel)} par an</>
        )}
        {config.parrainage.delaiSemaines && <>, crédités sous {config.parrainage.delaiSemaines} semaines</>}.
      </p>

      <BoutonCarte carte={carte} className="mt-5 w-full sm:w-auto" />
    </Section>
  )
}
