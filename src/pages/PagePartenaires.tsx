import type { Config } from '../lib/config'
import Section from '../components/Section'


export default function PagePartenaires({ config }: { config: Config }) {
  const p = config.partenaires
  return (
    <>
      <Section titre={p.titre} sousTitre={p.intro}>
        <div className="space-y-8">
          {p.categories.map((cat) => (
            <div key={cat.nom}>
              <h3 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-ios-gray">
                {cat.nom}
              </h3>
              <ul className="ombre-carte divide-y divide-ios-sep/60 overflow-hidden rounded-2xl bg-carte">
                {cat.liste.map((x) => (
                  <li key={x.nom} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="text-[17px] font-semibold text-ios-label">{x.nom}</p>
                      <p className="text-[15px] font-semibold text-ios-blue">{x.gain}</p>
                    </div>
                    <p className="mt-1.5 text-[15px] text-slate-600">{x.texte}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={x.lien}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center justify-center rounded-full bg-ios-fill px-4 py-2 text-[15px] font-semibold text-ios-blue active:opacity-80"
                      >
                        Ouvrir {x.nom.split(' ')[0]} ↗
                      </a>
                      <span className="text-[12px] text-ios-gray">Source : {x.source}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[13px] text-ios-gray">{p.rappel}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={config.liensFlyingBlue.gagner} target="_blank" rel="noopener" className="rounded-full bg-carte px-4 py-2 text-[15px] font-semibold text-ios-blue">
            Tous les partenaires pour gagner ↗
          </a>
          <a href={config.liensFlyingBlue.depenser} target="_blank" rel="noopener" className="rounded-full bg-carte px-4 py-2 text-[15px] font-semibold text-ios-blue">
            Tout ce qu’on peut faire avec ses miles ↗
          </a>
        </div>
      </Section>
    </>
  )
}
