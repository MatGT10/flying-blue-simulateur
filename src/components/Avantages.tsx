import type { Config } from '../lib/config'
import Section from './Section'

export default function Avantages({ config }: { config: Config }) {
  const cartes = config.cartes.filter((c) => c.cotisationAnnuelle > 0 || c.offre)
  const a = config.avantages
  return (
    <Section id="avantages" titre={a.titre} sousTitre={a.intro}>
      <div className="-mx-4 overflow-x-auto px-4" data-sans-geste><div className="rounded-2xl bg-white p-4">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-white py-3 pr-4 text-left font-semibold text-slate-500 w-[40%]">
                Avantage
              </th>
              {cartes.map((c) => (
                <th key={c.id} scope="col" className="py-3 px-3 text-left font-bold text-navy">
                  {c.courte}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.lignes.map((l) => (
              <tr key={l.label} className="border-t border-ios-sep/60">
                <th scope="row" className="sticky left-0 z-10 bg-white border-t border-ios-sep/60 py-3 pr-4 text-left font-medium text-slate-800">
                  {l.label}
                </th>
                {cartes.map((c) => {
                  const v = l.valeurs[c.id] ?? '—'
                  const vide = v === '—' || v === ''
                  const aConfirmer = v === 'À confirmer'
                  return (
                    <td
                      key={c.id}
                      className={`border-t border-ios-sep/60 py-3 px-3 align-top ${vide ? 'text-slate-400' : aConfirmer ? 'italic text-amber-700' : 'text-slate-800'}`}
                    >
                      {vide ? '—' : v}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
      <p className="mt-4 text-xs text-slate-500">
        Relevé sur les pages American Express au {new Date(config.dateMiseAJour).toLocaleDateString('fr-FR')}. Conditions
        détaillées dans les mentions légales de chaque carte.
      </p>
    </Section>
  )
}
