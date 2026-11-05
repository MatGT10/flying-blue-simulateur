import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import Section from '../components/Section'

export default function PageAccueil({ config }: { config: Config }) {
  const a = config.accueil
  return (
    <>
      <header className="bg-navy text-white">
        <div className="mx-auto w-full max-w-3xl px-4 pt-12 pb-14 sm:pt-20 sm:pb-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
            {a.etiquette}
          </p>
          <h1 className="mt-5 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">{a.titre}</h1>
          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-xl">{a.intro}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/simulateur"
              className="inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 text-base font-semibold text-navy-deep shadow-lg shadow-black/20 transition hover:brightness-105 active:scale-[0.98]"
            >
              Tester avec mes dépenses
            </Link>
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Voir comment ça marche
            </Link>
          </div>
        </div>
      </header>

      <Section titre={config.acteurs.titre} sousTitre={config.acteurs.intro} fond="blanc">
        <div className="grid gap-4 sm:grid-cols-2">
          {config.acteurs.liste.map((x) => (
            <article key={x.nom} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky">{x.role}</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{x.nom}</h3>
              <p className="mt-2 text-sm text-slate-600">{x.texte}</p>
              <a href={x.lien} target="_blank" rel="noopener" className="mt-3 inline-block text-sm font-semibold text-sky underline-offset-2 hover:underline">
                {x.lienLabel} ↗
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section titre="Pourquoi ce site ?">
        <div className="grid gap-4 sm:grid-cols-2">
          {a.pourquoi.map((p) => (
            <article key={p.titre} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">{p.titre}</h3>
              <p className="mt-2 text-sm text-slate-600">{p.texte}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section titre={a.chiffresTitre}>
        <div className="grid gap-4 sm:grid-cols-3">
          {a.chiffres.map((c) => (
            <div key={c.valeur + c.unite} className="rounded-2xl bg-navy p-5 text-white">
              <p className="text-3xl font-extrabold text-gold">{c.valeur}</p>
              <p className="text-sm font-semibold">{c.unite}</p>
              <p className="mt-2 text-sm text-blue-100">{c.texte}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section titre={a.parcoursTitre} fond="blanc">
        <ol className="grid gap-4 sm:grid-cols-2">
          {a.parcours.map((e) => (
            <li key={e.numero} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-base font-bold text-navy-deep">
                {e.numero}
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{e.titre}</h3>
                <p className="mt-1 text-sm text-slate-600">{e.texte}</p>
                <Link to={e.lien} className="mt-3 inline-block text-sm font-semibold text-sky underline-offset-2 hover:underline">
                  {e.cta} →
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  )
}
