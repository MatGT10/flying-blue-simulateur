import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import Section from '../components/Section'
import Installer from '../components/Installer'

const COULEURS_CHIFFRES = ['bleu', 'vert', 'or']

export default function PageAccueil({ config }: { config: Config }) {
  const a = config.accueil
  return (
    <>
      <header className="hero-degrade text-white">
        <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-8 sm:pt-14 sm:pb-12">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
            {a.etiquette}
          </p>
          <h1 className="mt-4 text-[34px] leading-[1.08] sm:text-5xl font-bold tracking-tight">{a.titre}</h1>
          <p className="mt-4 text-[17px] text-white/85 max-w-xl">{a.intro}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/simulateur"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-[17px] font-semibold text-ios-blue shadow-lg shadow-black/10 transition active:opacity-80"
            >
              Tester avec mes dépenses
            </Link>
            <Link
              to="/inscription"
              className="inline-flex items-center justify-center rounded-2xl bg-white/15 px-6 py-3.5 text-[17px] font-semibold text-white ring-1 ring-white/30 backdrop-blur transition active:opacity-80"
            >
              Voir comment ça marche
            </Link>
          </div>
        </div>
      </header>

      <Section titre={config.acteurs.titre} sousTitre={config.acteurs.intro}>
        <div className="grid gap-4 sm:grid-cols-2">
          {config.acteurs.liste.map((x) => (
            <article key={x.nom} className="ombre-carte rounded-2xl bg-carte p-5">
              <div><p className="text-[12px] font-semibold uppercase tracking-wide text-ios-gray">{x.role}</p>
                  <h3 className="text-[18px] font-bold text-ios-label">{x.nom}</h3></div>
              <p className="mt-3 text-[15px] text-slate-600">{x.texte}</p>
              <a href={x.lien} target="_blank" rel="noopener" className="mt-3 inline-block text-[15px] font-semibold text-ios-blue">
                {x.lienLabel} ↗
              </a>
            </article>
          ))}
        </div>
      </Section>

      <Section titre="Pourquoi ce site ?">
        <div className="grid gap-4 sm:grid-cols-2">
          {a.pourquoi.map((p) => (
            <article key={p.titre} className="ombre-carte flex gap-4 rounded-2xl bg-carte p-5">
              <div>
                <h3 className="font-bold text-ios-label">{p.titre}</h3>
                <p className="mt-1.5 text-[15px] text-slate-600">{p.texte}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section titre={a.chiffresTitre}>
        <div className="grid gap-4 sm:grid-cols-3">
          {a.chiffres.map((c, i) => (
            <div key={c.valeur + c.unite} className={`ombre-carte rounded-2xl p-5 text-white degrade-${COULEURS_CHIFFRES[i] ?? 'bleu'}`}>
              <p className="text-[34px] leading-none font-bold">{c.valeur}</p>
              <p className="mt-1 text-[15px] font-semibold text-white/90">{c.unite}</p>
              <p className="mt-2 text-[14px] text-white/80">{c.texte}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section titre="Sur votre téléphone">
        <Installer />
      </Section>

      <Section titre={a.parcoursTitre}>
        <ol className="grid gap-4 sm:grid-cols-2">
          {a.parcours.map((e) => (
            <li key={e.numero} className="ombre-carte flex gap-4 rounded-2xl bg-carte p-5">
              <span className="degrade-bleu flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[17px] font-bold text-white shadow-sm">
                {e.numero}
              </span>
              <div>
                <h3 className="font-bold text-ios-label">{e.titre}</h3>
                <p className="mt-1 text-[15px] text-slate-600">{e.texte}</p>
                <Link to={e.lien} className="mt-3 inline-block text-[15px] font-semibold text-ios-blue">
                  {e.cta} ›
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </>
  )
}
