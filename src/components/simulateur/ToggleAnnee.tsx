import type { Mode } from '../../lib/calcul'

interface Props {
  mode: Mode
  onChange: (m: Mode) => void
}

const options: { valeur: Mode; label: string; aide: string }[] = [
  { valeur: 'premiereAnnee', label: '1ère année', aide: 'Bonus de bienvenue et cotisation offerte selon la carte' },
  { valeur: 'croisiere', label: 'Années suivantes', aide: 'Cotisation pleine, sans bonus' },
]

export default function ToggleAnnee({ mode, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Période simulée" className="grid grid-cols-2 gap-1 rounded-xl bg-ios-fill p-0.5">
      {options.map((o) => {
        const actif = o.valeur === mode
        return (
          <button
            key={o.valeur}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(o.valeur)}
            className={`rounded-lg px-3 py-2 text-left transition ${
              actif ? 'bg-segment shadow-sm text-ios-label' : 'text-slate-600'
            }`}
          >
            <span className="block text-sm font-semibold">{o.label}</span>
            <span className="block text-xs text-slate-500">{o.aide}</span>
          </button>
        )
      })}
    </div>
  )
}
