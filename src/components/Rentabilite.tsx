import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import { seuilRentabilite } from '../lib/calcul'
import { fmtEuros } from '../lib/format'
import Section from './Section'


/** 0,5 → « 0,5 mile », 1 → « 1 mile », 1,3 → « 1,3 mile ». */
function fmtTaux(t: number): string {
  return `${t.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} mile${t > 1 ? 's' : ''}`
}

export default function Rentabilite({ config }: { config: Config }) {
  const lignes = config.cartes.filter((c) => c.cotisationAnnuelle > 0).map((c) => seuilRentabilite(c, config))
  const basse = (config.valeurMile.basse * 100).toLocaleString('fr-FR')
  const haute = (config.valeurMile.haute * 100).toLocaleString('fr-FR')

  return (
    <Section id="rentabilite" titre={config.rentabilite.titre} sousTitre={config.rentabilite.intro}>
      <div className="mb-6 rounded-2xl bg-sky-soft px-5 py-4 text-sm text-navy">
        <p className="font-semibold">Deux chiffres à ne pas confondre</p>
        <p className="mt-1">
          <span className="font-semibold">Ce que vous gagnez</span> : un nombre de miles par euro dépensé, fixé par la carte
          (par exemple 1 mile par euro avec la Gold).{' '}
          <span className="font-semibold">Ce que vaut un mile</span> : ce qu’il vous fait économiser quand vous l’utilisez,
          environ {basse} centime d’euro en usage prudent, jusqu’à {haute} centime en usage optimisé.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {lignes.map((s) => (
          <article key={s.carte.id} className="ombre-carte rounded-2xl bg-white p-5">
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
            <dl className="mt-3 space-y-1 text-sm text-slate-600">
              <div className="flex gap-2">
                <dt className="shrink-0 text-slate-500">Vous gagnez :</dt>
                <dd>{fmtTaux(s.carte.taux.courant)} par euro dépensé</dd>
              </div>
              <div className="flex gap-2">
                <dt className="shrink-0 text-slate-500">Chaque mile vaut :</dt>
                <dd>{basse} centime (estimation prudente)</dd>
              </div>
            </dl>
            {s.plafonneParGratuite ? (
              <p className="mt-2 text-sm text-emerald-700">
                Cotisation offerte dès {fmtEuros(s.carte.cotisationOfferteDes ?? 0)} de dépenses par an : c’est ce seuil qui
                compte.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Si vous valorisez vos miles à {haute} centime (billets Business, promos), le seuil descend à{' '}
                {s.mensuelOptimiste === null ? '—' : fmtEuros(s.mensuelOptimiste)} / mois.
              </p>
            )}
          </article>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Avantages non monétaires non comptés : bagage en soute, XP, assurances, bon d’achat.{' '}
        <Link to="/simulateur" className="underline underline-offset-2">Le simulateur</Link> donne votre seuil exact selon
        votre répartition de dépenses.
      </p>
    </Section>
  )
}
