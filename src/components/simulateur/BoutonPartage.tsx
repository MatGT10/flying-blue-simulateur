import { useState } from 'react'
import type { Config } from '../../lib/config'
import { fmtGain } from '../../lib/format'
import { construireUrlPartage, partager } from '../../lib/partage'
import type { EtatSimulation } from './useSimulation'

export default function BoutonPartage({ config, sim }: { config: Config; sim: EtatSimulation }) {
  const [etat, setEtat] = useState<'idle' | 'copie' | 'partage' | 'echec'>('idle')
  const [urlSecours, setUrlSecours] = useState<string | null>(null)
  const { meilleure } = sim.simulation

  const onClick = async () => {
    const url = construireUrlPartage({ brutes: sim.brutes, mode: sim.mode }, config.categories)
    const texte =
      meilleure.gainNetMedian > 0
        ? `Ma simulation Flying Blue : ${meilleure.carte.nom}, gain net ${fmtGain(meilleure.gainNetBas)} à ${fmtGain(meilleure.gainNetHaut)} par an.`
        : 'Ma simulation Flying Blue : à mon niveau de dépenses, aucune carte n’est rentable.'
    const r = await partager(url, config.site.titre, texte)
    setEtat(r)
    // Si rien n'a marché, on affiche le lien pour une copie manuelle.
    setUrlSecours(r === 'echec' ? url : null)
    if (r === 'copie') setTimeout(() => setEtat('idle'), 2500)
  }

  const libelle = etat === 'copie' ? 'Lien copié !' : etat === 'echec' ? 'Copiez le lien ci-dessous' : 'Partager mon résultat'

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ios-fill px-4 py-2.5 text-[15px] font-semibold text-ios-blue transition active:opacity-80"
      >
        <span aria-hidden="true">↗</span> {libelle}
      </button>
      {urlSecours && (
        <input
          type="text"
          readOnly
          value={urlSecours}
          onFocus={(e) => e.target.select()}
          aria-label="Lien de partage"
          className="w-full rounded-lg bg-ios-bg px-3 py-2 text-xs text-slate-700"
        />
      )}
    </div>
  )
}
