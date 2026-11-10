import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import Section from '../components/Section'

export default function PageInscription({ config }: { config: Config }) {
  const i = config.inscription
  return (
    <>
      <Section titre={i.titre} sousTitre={i.intro} icone="📝" couleur="bleu">
        <ol className="relative border-l-2 border-ios-sep pl-6 sm:pl-8">
          {i.etapes.map((e, idx) => (
            <li key={e.titre} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[31px] sm:-left-[39px] flex h-8 w-8 items-center justify-center degrade-bleu rounded-full text-sm font-bold text-white ring-4 ring-ios-bg shadow-sm">
                {idx + 1}
              </span>
              <div className="ombre-carte rounded-2xl bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900">{e.titre}</h3>
                  <span className="rounded-full bg-sky-soft px-2.5 py-0.5 text-xs font-semibold text-navy">⏱ {e.delai}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{e.detail}</p>
                {e.lien && e.lienLabel && (e.lien.startsWith('/') ? (
                  <Link
                    to={e.lien}
                    className="mt-3 inline-flex items-center justify-center rounded-2xl bg-ios-fill px-4 py-2.5 text-[15px] font-semibold text-ios-blue transition active:opacity-80"
                  >
                    {e.lienLabel}
                  </Link>
                ) : (
                  <a
                    href={e.lien}
                    target="_blank"
                    rel={e.lien.includes('referral') ? 'sponsored noopener' : 'noopener'}
                    className="mt-3 inline-flex items-center justify-center rounded-2xl bg-ios-blue px-4 py-2.5 text-sm font-semibold text-white transition active:opacity-80"
                  >
                    {e.lienLabel}
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section titre={i.conseilsTitre} icone="💡" couleur="or">
        <ul className="grid gap-3">
          {i.conseils.map((c) => (
            <li key={c} className="flex gap-3 rounded-2xl bg-white p-4 text-sm text-slate-700">
              <span className="text-gold" aria-hidden="true">★</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-slate-600">
          Pas encore sûr que ce soit rentable pour vous ?{' '}
          <Link to="/simulateur" className="font-semibold text-sky underline-offset-2 hover:underline">
            Faites la simulation d’abord
          </Link>
          .
        </p>
      </Section>
    </>
  )
}
