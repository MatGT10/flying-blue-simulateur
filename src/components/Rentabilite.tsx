import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import { seuilRentabilite } from '../lib/calcul'
import { fmtEuros } from '../lib/format'
import Section from './Section'

export default function Rentabilite({ config }: { config: Config }) {
  const lignes = config.cartes.filter((c) => c.cotisationAnnuelle > 0).map((c) => seuilRentabilite(c, config))
  const basse = (config.valeurMile.basse * 100).toLocaleString('fr-FR')
  const haute = (config.valeurMile.haute * 100).toLocaleString('fr-FR')

  return (
    <Section id="rentabilite" titre={config.rentabilite.titre} sousTitre={config.rentabilite.intro}>
      <div className="grid gap-4 sm:grid-cols-3">
        {lignes.map((s) => (
          <article key={s.carte.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-slate-900">{s.carte.nom}</h3>
            <p className="text-sm text-slate-500">
              Cotisation {fmtEuros(s.carte.cotisationAnnuelle)} / an
              {s.carte.offre?.premiereAnneeOfferte && (
                <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-amber-800">
                  1ère année offerte
                </span>
              )}
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">Rentable à partir de</p>
            <p className="text-3xl font-extrabold text-navy">
              {s.mensuelPrudent === null ? '—' : fmtEuros(s.mensuelPrudent)}
              <span className="text-base font-medium text-slate-500"> / mois</span>
            </p>
            {s.plafonneParGratuite ? (
              <p className="mt-1 text-sm text-emerald-700">
                Cotisation offerte dès {fmtEuros(s.carte.cotisationOfferteDes ?? 0)} de dépenses par an.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                avec un mile à {basse} centime ; dès {s.mensuelOptimiste === null ? '—' : fmtEuros(s.mensuelOptimiste)}
                {' '}/ mois si vous valorisez vos miles à {haute} centime.
              </p>
            )}
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Avantages non monétaires non comptés : bagage en soute, XP, assurances, bon d’achat. <Link to="/" className="underline underline-offset-2">Le simulateur</Link> donne votre seuil
        exact selon votre répartition de dépenses.
      </p>
    </Section>
  )
}
