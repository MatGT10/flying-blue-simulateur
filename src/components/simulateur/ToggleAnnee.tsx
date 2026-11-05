import type { Mode } from '../../lib/calcul'

interface Props {
  mode: Mode
  onChange: (m: Mode) => void
}

const options: { valeur: Mode; label: string; aide: string }[] = [
  { valeur: 'croisiere', label: 'Années suivantes', aide: 'Cotisation pleine, sans bonus' },
  { valeur: 'premiereAnnee', label: '1ère année', aide: 'Avec l’offre de bienvenue' },
]

export default function ToggleAnnee({ mode, onChange }: Props) {
  return (
    <div role="radiogroup" aria-label="Période simulée" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200 p-1">
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
              actif ? 'bg-white shadow text-navy' : 'text-slate-600 hover:text-slate-900'
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
