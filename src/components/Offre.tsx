import type { Config } from '../lib/config'
import { fmtDate, fmtEntier, fmtEuros } from '../lib/format'
import BoutonCarte from './BoutonCarte'
import Section from './Section'

export default function Offre({ config }: { config: Config }) {
  const o = config.offreDuMoment
  if (!o.actif) return null
  const avecOffre = config.cartes.filter((c) => c.offre && c.offre.milesBienvenue > 0)
  const vedette = avecOffre.find((c) => c.id === o.carteMiseEnAvant) ?? avecOffre[0]
  const autres = avecOffre.filter((c) => c.id !== vedette?.id)

  return (
    <Section id="offre" titre={o.titre} sousTitre={o.description}>
      <p className="inline-block rounded-full bg-ios-orange/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-ios-orange">
        {o.etiquette}
      </p>
      {o.dateFin && <p className="mt-2 text-[13px] text-ios-gray">Valable jusqu’au {fmtDate(o.dateFin)}.</p>}

      {vedette && vedette.offre && (
        <div className="degrade-bleu ombre-carte mt-4 rounded-3xl p-5 sm:p-6 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[20px] font-bold">{vedette.nom}</h3>
            {vedette.offre.premiereAnneeOfferte && (
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[12px] font-semibold text-white">
                1ère année offerte
              </span>
            )}
          </div>
          <p className="mt-3 text-[44px] leading-none font-bold">{fmtEntier(vedette.offre.milesBienvenue)} miles</p>
          <p className="mt-3 text-[15px] text-white/85">
            dès {fmtEuros(vedette.offre.conditionDepense)} dépensés dans les {vedette.offre.conditionDelaiMois} premiers mois
            {vedette.offre.premiereAnneeOfferte
              ? `, et aucune cotisation la première année (${fmtEuros(vedette.cotisationAnnuelle)} / an ensuite).`
              : `. Cotisation ${fmtEuros(vedette.cotisationAnnuelle)} / an.`}
          </p>
          <BoutonCarte carte={vedette} variante="blanc" className="mt-5 w-full sm:w-auto" />
          <a href="#parrainage" className="mt-3 block text-[15px] text-white/90">
            Voir où partir avec ces miles ›
          </a>
        </div>
      )}

      {autres.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {autres.map((c) => (
            <div key={c.id} className="ombre-carte rounded-2xl bg-carte p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-ios-label">{c.nom}</h3>
                {c.offre?.premiereAnneeOfferte && (
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    1ère année offerte
                  </span>
                )}
              </div>
              <p className="mt-2 text-[24px] font-bold text-ios-label">{fmtEntier(c.offre?.milesBienvenue ?? 0)} miles</p>
              <p className="text-[13px] text-ios-gray">
                dès {fmtEuros(c.offre?.conditionDepense ?? 0)} en {c.offre?.conditionDelaiMois} mois
                {c.offre?.premiereAnneeOfferte ? '' : ` · ${fmtEuros(c.cotisationAnnuelle)} / an dès le 1er mois`}
              </p>
              <BoutonCarte carte={c} variante="lien" className="mt-3 text-ios-blue" />
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[12px] text-ios-gray">Liens de parrainage, voir la section Transparence.</p>
    </Section>
  )
}
