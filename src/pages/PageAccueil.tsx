import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import Section from '../components/Section'
import Installer from '../components/Installer'

export default function PageAccueil({ config }: { config: Config }) {
  const a = config.accueil
  return (
    <>
      <header className="bg-ios-bg">
        <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-6 sm:pt-14 sm:pb-10">
          <p className="text-[13px] font-medium uppercase tracking-wide text-ios-gray">{a.etiquette}</p>
          <h1 className="mt-2 text-[34px] leading-[1.1] sm:text-5xl font-bold tracking-tight text-ios-label">{a.titre}</h1>
          <p className="mt-4 text-[17px] text-slate-600 max-w-xl">{a.intro}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/simulateur"
              className="inline-flex items-center justify-center rounded-2xl bg-ios-blue px-6 py-3.5 text-[17px] font-semibold text-white transition active:opacity-80"
            >
              Tester avec mes dépenses
            </Link>
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center rounded-2xl bg-ios-fill px-6 py-3.5 text-[17px] font-semibold text-ios-blue transition active:opacity-80"
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
            <div key={c.valeur + c.unite} className="rounded-2xl bg-white p-5">
              <p className="text-3xl font-bold text-ios-blue">{c.valeur}</p>
              <p className="text-sm font-semibold text-ios-label">{c.unite}</p>
              <p className="mt-2 text-sm text-slate-600">{c.texte}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section titre="Sur votre téléphone">
        <Installer />
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
