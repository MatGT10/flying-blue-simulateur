import type { Categorie } from '../../lib/config'

interface Props {
  categorie: Categorie
  valeur: string
  onChange: (valeur: string) => void
}

export default function ChampDepense({ categorie, valeur, onChange }: Props) {
  const id = `depense-${categorie.id}`
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {categorie.label}
      </label>
      {categorie.aide && <p className="mt-0.5 text-xs text-slate-500">{categorie.aide}</p>}
      <div className="mt-2 flex items-stretch rounded-xl border border-slate-300 bg-white focus-within:border-sky focus-within:ring-2 focus-within:ring-sky/30">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={10}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder="0"
          className="w-full min-w-0 bg-transparent px-4 py-3 text-lg font-medium outline-none"
        />
        <span className="flex items-center whitespace-nowrap rounded-r-xl border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
          € / mois
        </span>
      </div>
    </div>
  )
}
