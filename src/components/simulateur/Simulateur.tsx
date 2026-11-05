import type { Config } from '../../lib/config'
import { fmtEuros, fmtGain } from '../../lib/format'
import ChampDepense from './ChampDepense'
import ToggleAnnee from './ToggleAnnee'
import CarteResultat from './CarteResultat'
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
    <section id="simulateur" className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Vos dépenses mensuelles</h2>
        <p className="mt-2 text-slate-600">
          Des ordres de grandeur suffisent. Les résultats se mettent à jour en direct.
        </p>

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
          <div className="rounded-2xl bg-sky-soft px-5 py-4">
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

          <p className="mt-6 text-xs text-slate-500">
            Valeur du mile retenue : {config.valeurMile.basse.toLocaleString('fr-FR')} € à{' '}
            {config.valeurMile.haute.toLocaleString('fr-FR')} €. Simulation indicative, non contractuelle, basée sur
            des données au {new Date(config.dateMiseAJour).toLocaleDateString('fr-FR')}.
          </p>
        </div>
      </div>

      {/* Rappel collant sur mobile : visible tant que la section est à l'écran. */}
      <div className="sticky bottom-0 z-10 mt-6 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <a href="#resultats" className="mx-auto flex max-w-3xl items-center justify-between gap-3 text-sm">
          <span className="truncate text-slate-600">
            {tousNegatifs ? 'Aucune carte rentable' : `Meilleure : ${meilleure.carte.courte}`}
          </span>
          <span className={`shrink-0 font-bold ${tousNegatifs ? 'text-rose-700' : 'text-emerald-700'}`}>
            {fmtGain(meilleure.gainNetBas)} à {fmtGain(meilleure.gainNetHaut)}
          </span>
        </a>
      </div>
    </section>
  )
}
