import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import { fmtDate, fmtEntier } from '../lib/format'
import { centimesParMile } from '../lib/valeur'
import Section from './Section'

export default function BonsPlans({ config }: { config: Config }) {
  const b = config.bonsPlans
  if (!b.liste.length) return null
  const courts = b.liste.filter((x) => x.trajet.startsWith('Paris'))
  const longs = b.liste.filter((x) => !x.trajet.startsWith('Paris'))

  const Ligne = ({ x }: { x: (typeof b.liste)[number] }) => {
    const cpm = x.prixCashApprox ? centimesParMile(x.prixCashApprox, x.miles, 0) : null
    const lienCalcul = `/valeur?v=${encodeURIComponent(`${x.trajet} (${x.cabine})|0|${x.miles}|0`)}`
    return (
      <li className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="font-semibold text-ios-label">
            {x.trajet}
            {x.extraExclusif && (
              <span className="ml-2 rounded-full bg-ios-orange/15 px-2 py-0.5 text-[11px] font-semibold text-ios-orange">Extra Exclusif</span>
            )}
          </p>
          <p className="text-[13px] text-ios-gray">
            {x.cabine} · −25 %{cpm !== null && <> · ≈ {cpm.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ct/mile</>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-ios-blue">dès {fmtEntier(x.miles)} miles</p>
          <Link to={lienCalcul} className="text-[12px] text-ios-blue">
            Calculer la valeur ›
          </Link>
        </div>
      </li>
    )
  }

  return (
    <Section id="bons-plans" titre={`${b.titre} · ${b.mois}`} sousTitre={b.intro}>
      <div className="rounded-2xl bg-sky-soft px-4 py-3 text-[13px] text-ios-blue">
        Réservez avant le {fmtDate(b.reserverAvant)}, voyagez jusqu’au {fmtDate(b.voyagerAvant)}. {b.conditions}
      </div>
      {courts.length > 0 && (
        <>
          <h3 className="mt-5 mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-ios-gray">Au départ de Paris</h3>
          <ul className="divide-y divide-ios-sep/60 overflow-hidden rounded-2xl bg-white">
            {courts.map((x) => <Ligne key={x.trajet + x.cabine} x={x} />)}
          </ul>
        </>
      )}
      {longs.length > 0 && (
        <>
          <h3 className="mt-5 mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-ios-gray">Long-courrier, via Paris ou Amsterdam</h3>
          <ul className="divide-y divide-ios-sep/60 overflow-hidden rounded-2xl bg-white">
            {longs.map((x) => <Ligne key={x.trajet + x.cabine} x={x} />)}
          </ul>
        </>
      )}
      <a
        href={config.liensFlyingBlue.billetsPrimes}
        target="_blank"
        rel="noopener"
        className="mt-4 inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-ios-blue px-5 py-3 text-[15px] font-semibold text-white active:opacity-80"
      >
        Voir la liste complète sur Flying Blue ↗
      </a>
      <p className="mt-3 text-[12px] text-ios-gray">
        Relevé sur flyingblue.com le {fmtDate(config.dateMiseAJour)}. Les disponibilités changent chaque jour.
      </p>
    </Section>
  )
}
