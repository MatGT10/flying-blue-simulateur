import type { Config } from '../../lib/config'
import { fmtDate, fmtEuros, fmtGain } from '../../lib/format'
import ChampDepense from './ChampDepense'
import ToggleAnnee from './ToggleAnnee'
import CarteResultat from './CarteResultat'
import BoutonPartage from './BoutonPartage'
import ProchainVol from './ProchainVol'
import type { EtatSimulation } from './useSimulation'

interface Props {
  config: Config
  sim: EtatSimulation
}

export default function Simulateur({ config, sim }: Props) {
  const { simulation, mode } = sim
  const { meilleure } = simulation
  const tousNegatifs = meilleure.gainNetMedian <= 0

  return (
    <section id="simulateur" className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Vos dépenses mensuelles</h2>
        <p className="mt-2 text-slate-600">
          Des ordres de grandeur suffisent. Les résultats se mettent à jour en direct.
        </p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-3 text-sm">
          {[
            'Indiquez ce que vous dépensez chaque mois, par type d’achat.',
            'Choisissez « 1ère année » (avec l’offre) ou « années suivantes ».',
            'Lisez le gain net : la valeur de vos miles, moins la cotisation.',
          ].map((t, i) => (
            <li key={t} className="flex gap-3 rounded-xl bg-sky-soft px-4 py-3 text-navy">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ios-blue text-xs font-bold text-white">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {config.categories.map((cat) => (
            <ChampDepense
              key={cat.id}
              categorie={cat}
              valeur={sim.brutes[cat.id] ?? ''}
              onChange={(v) => sim.setChamp(cat.id, v)}
            />
          ))}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Total : <span className="font-semibold text-slate-800">{fmtEuros(simulation.depenseMensuelleTotale)}</span> par mois,
          soit {fmtEuros(simulation.depenseMensuelleTotale * 12)} par an.
        </p>

        <div className="mt-8">
          <ToggleAnnee mode={mode} onChange={sim.setMode} />
        </div>

        <div id="resultats" className="mt-8 scroll-mt-24">
          <div className="degrade-bleu ombre-carte rounded-2xl px-5 py-4 text-white [&_*]:text-white">
            {tousNegatifs ? (
              <p className="text-navy">
                <span className="font-semibold">À ce niveau de dépenses, aucune carte n’est rentable.</span>{' '}
                Les cotisations dépassent la valeur des miles gagnés. Regardez le point mort de chaque carte pour
                savoir à partir de quel montant ça bascule.
              </p>
            ) : (
              <p className="text-navy">
                <span className="font-semibold">Meilleure option : {meilleure.carte.nom}</span>, avec un gain net
                estimé de {fmtGain(meilleure.gainNetBas)} à {fmtGain(meilleure.gainNetHaut)}{' '}
                {mode === 'premiereAnnee' ? 'la première année' : 'par an'}.
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {simulation.resultats.map((r) => (
              <CarteResultat key={r.carte.id} resultat={r} meilleure={r.carte.id === meilleure.carte.id} />
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
            <BoutonPartage config={config} sim={sim} />
            <p className="text-xs text-slate-500">Le lien reprend vos montants : votre interlocuteur retrouve la même simulation.</p>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Chaque mile est valorisé entre {(config.valeurMile.basse * 100).toLocaleString('fr-FR')} et{' '}
            {(config.valeurMile.haute * 100).toLocaleString('fr-FR')} centime d’euro, d’où la fourchette. Simulation indicative, non contractuelle, basée sur
            des données au {fmtDate(config.dateMiseAJour)}.
          </p>

          <ProchainVol config={config} simulation={simulation} />
        </div>
      </div>

      {/* Rappel collant sur mobile : visible tant que la section est à l'écran. */}
      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 mx-auto mt-6 max-w-md md:hidden">
        <div className="glass rounded-full px-5 py-2.5">
        <a href="#resultats" className="mx-auto flex max-w-3xl items-center justify-between gap-3 text-sm">
          <span className="truncate text-slate-600">
            {tousNegatifs ? 'Aucune carte rentable' : `Meilleure : ${meilleure.carte.courte}`}
          </span>
          <span className={`shrink-0 font-bold ${tousNegatifs ? 'text-rose-700' : 'text-emerald-700'}`}>
            {fmtGain(meilleure.gainNetBas)} à {fmtGain(meilleure.gainNetHaut)}
          </span>
        </a>
      </div>
      </div>
    </section>
  )
}
