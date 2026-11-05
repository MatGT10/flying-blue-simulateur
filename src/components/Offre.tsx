import type { Config } from '../lib/config'
import { fmtDate, fmtEntier, fmtEuros } from '../lib/format'

export default function Offre({ config }: { config: Config }) {
  const o = config.offreDuMoment
  if (!o.actif) return null
  const avecOffre = config.cartes.filter((c) => c.offre && c.offre.milesBienvenue > 0)
  const vedette = avecOffre.find((c) => c.id === o.carteMiseEnAvant) ?? avecOffre[0]
  const autres = avecOffre.filter((c) => c.id !== vedette?.id)

  return (
    <section id="offre" className="bg-navy py-12 sm:py-16 text-white">
      <div className="mx-auto w-full max-w-3xl px-4">
        <p className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy-deep">
          {o.etiquette}
        </p>
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight">{o.titre}</h2>
        <p className="mt-3 text-blue-100">{o.description}</p>
        {o.dateFin && <p className="mt-2 text-sm text-blue-200">Valable jusqu’au {fmtDate(o.dateFin)}.</p>}

        {vedette && vedette.offre && (
          <div className="mt-8 rounded-3xl bg-gradient-to-br from-navy-deep to-sky/40 p-6 sm:p-8 ring-2 ring-gold/70">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold">{vedette.nom}</h3>
              {vedette.offre.premiereAnneeOfferte && (
                <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-navy-deep">
                  1ère année offerte
                </span>
              )}
            </div>
            <p className="mt-3 text-4xl font-extrabold">{fmtEntier(vedette.offre.milesBienvenue)} miles</p>
            <p className="mt-1 text-blue-100">
              dès {fmtEuros(vedette.offre.conditionDepense)} dépensés dans les {vedette.offre.conditionDelaiMois} premiers
              mois
              {vedette.offre.premiereAnneeOfferte
                ? `, et aucune cotisation la première année (${fmtEuros(vedette.cotisationAnnuelle)} / an ensuite).`
                : `. Cotisation ${fmtEuros(vedette.cotisationAnnuelle)} / an.`}
            </p>
            {vedette.lienParrainage && (
              <a
                href={vedette.lienParrainage}
                target="_blank"
                rel="sponsored noopener"
                className="mt-6 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-gold px-6 py-3 font-semibold text-navy-deep transition hover:brightness-105 active:scale-[0.98]"
              >
                {o.ctaLabel} {vedette.courte}
                <span className="sr-only"> (lien de parrainage, nouvel onglet)</span>
              </a>
            )}
            <a href="#parrainage" className="mt-3 block text-sm text-blue-100 underline underline-offset-2 hover:text-white">
              Voir où partir avec ces miles →
            </a>
          </div>
        )}

        {autres.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {autres.map((c) => (
              <div key={c.id} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{c.nom}</h3>
                  {c.offre?.premiereAnneeOfferte && (
                    <span className="rounded-full bg-gold/90 px-2 py-0.5 text-[11px] font-semibold text-navy-deep">
                      1ère année offerte
                    </span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold">{fmtEntier(c.offre?.milesBienvenue ?? 0)} miles</p>
                <p className="text-sm text-blue-200">
                  dès {fmtEuros(c.offre?.conditionDepense ?? 0)} en {c.offre?.conditionDelaiMois} mois
                  {c.offre?.premiereAnneeOfferte ? '' : ` · ${fmtEuros(c.cotisationAnnuelle)} / an dès le 1er mois`}
                </p>
                {c.lienParrainage && (
                  <a
                    href={c.lienParrainage}
                    target="_blank"
                    rel="sponsored noopener"
                    className="mt-3 inline-block text-sm font-medium text-white underline underline-offset-2"
                  >
                    {o.ctaLabel} {c.courte}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-blue-200">Liens de parrainage, voir la section Transparence.</p>
      </div>
    </section>
  )
}
