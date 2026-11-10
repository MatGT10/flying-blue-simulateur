import { useEffect, useMemo, useState } from 'react'
import type { Config } from '../lib/config'
import { fmtEuros, fmtEntier } from '../lib/format'
import { partager } from '../lib/partage'
import { classerVols, volsDepuisParams, volsVersParams, type Verdict, type VolSaisi } from '../lib/valeur'
import Section from '../components/Section'

type Brut = { id: string; libelle: string; prixCash: string; miles: string; taxes: string }

const CLE = 'fb-vols'

/** Vols enregistrés sur l'appareil, si la liste est bien formée. */
function lireSauvegarde(): Brut[] {
  try {
    const v = localStorage.getItem(CLE)
    const l = v ? (JSON.parse(v) as unknown) : null
    if (!Array.isArray(l)) return []
    return l
      .filter((x): x is Brut => !!x && typeof x === 'object' && ['id', 'libelle', 'prixCash', 'miles', 'taxes'].every((k) => typeof (x as Record<string, unknown>)[k] === 'string'))
      .slice(0, 20)
  } catch {
    return []
  }
}

let compteur = 0
const nouvelId = () => `vol-${Date.now()}-${compteur++}`

function versSaisi(b: Brut): VolSaisi {
  return { id: b.id, libelle: b.libelle, prixCash: Number(b.prixCash) || 0, miles: Number(b.miles) || 0, taxes: Number(b.taxes) || 0 }
}

const styleVerdict: Record<Verdict, { label: string; classes: string }> = {
  excellent: { label: 'Très bonne affaire : payez en miles', classes: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  correct: { label: 'Correct : payer en miles se défend', classes: 'bg-sky-soft text-navy border-sky/30' },
  mauvais: { label: 'Mauvaise affaire : payez en euros, gardez vos miles', classes: 'bg-rose-50 text-rose-800 border-rose-200' },
  invalide: { label: 'Complétez le prix et les miles', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
}

function fmtCentimes(c: number): string {
  return `${c.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ct`
}

export default function PageValeur({ config }: { config: Config }) {
  const cfg = config.valeurVol
  const [vols, setVols] = useState<Brut[]>(() => {
    // Priorité : lien partagé, puis derniers vols saisis sur cet appareil, puis exemples.
    const depuisUrl = typeof window === 'undefined' ? [] : volsDepuisParams(new URLSearchParams(window.location.search))
    if (depuisUrl.length === 0) {
      const sauvegarde = lireSauvegarde()
      if (sauvegarde.length > 0) return sauvegarde
    }
    const source = depuisUrl.length > 0 ? depuisUrl : cfg.exemples.map((e) => ({ ...e, id: nouvelId() }))
    return source.map((v) => ({ id: v.id, libelle: v.libelle, prixCash: String(v.prixCash), miles: String(v.miles), taxes: String(v.taxes) }))
  })
  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(vols))
    } catch {
      // stockage indisponible
    }
  }, [vols])
  const [etatPartage, setEtatPartage] = useState<'idle' | 'copie' | 'echec'>('idle')

  const classes = useMemo(() => classerVols(vols.map(versSaisi), cfg.seuils), [vols, cfg.seuils])
  const meilleur = classes.find((v) => v.centimesParMile !== null)

  const modifier = (id: string, champ: keyof Brut, valeur: string) =>
    setVols((prev) => prev.map((v) => (v.id === id ? { ...v, [champ]: valeur } : v)))
  const supprimer = (id: string) => setVols((prev) => prev.filter((v) => v.id !== id))
  const ajouter = () => setVols((prev) => [...prev, { id: nouvelId(), libelle: '', prixCash: '', miles: '', taxes: '' }])

  const onPartager = async () => {
    const params = volsVersParams(vols.map(versSaisi))
    const url = `${window.location.origin}/valeur?${params.toString()}`
    const r = await partager(url, cfg.titre, 'Ma comparaison de vols en miles Flying Blue')
    setEtatPartage(r === 'copie' ? 'copie' : r === 'echec' ? 'echec' : 'idle')
    setTimeout(() => setEtatPartage('idle'), 2500)
  }

  return (
    <>
      <Section titre={cfg.titre} sousTitre={cfg.intro}>
        <div className="rounded-2xl bg-sky-soft px-5 py-4 text-sm text-navy">
          <p className="font-semibold">Où trouver les chiffres</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {cfg.ouTrouver.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>

        <ul className="mt-6 space-y-4">
          {vols.map((v, i) => {
            const ev = classes.find((c) => c.id === v.id)
            const sv = styleVerdict[ev?.verdict ?? 'invalide']
            return (
              <li key={v.id} className="rounded-2xl bg-carte p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <input
                    type="text"
                    value={v.libelle}
                    onChange={(e) => modifier(v.id, 'libelle', e.target.value)}
                    placeholder={`Vol ${i + 1} : destination, date, cabine`}
                    aria-label="Nom du vol"
                    className="w-full min-w-0 rounded-lg bg-ios-bg px-3 py-2 text-sm font-semibold text-ios-label outline-none focus:ring-2 focus:ring-ios-blue"
                  />
                  <button
                    type="button"
                    onClick={() => supprimer(v.id)}
                    aria-label="Supprimer ce vol"
                    className="shrink-0 rounded-lg px-2 py-2 text-slate-400 hover:bg-slate-100 hover:text-rose-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(
                    [
                      ['prixCash', 'Prix en euros', '€'],
                      ['miles', 'Prix en miles', 'miles'],
                      ['taxes', 'Taxes avec les miles', '€'],
                    ] as const
                  ).map(([champ, label, unite]) => (
                    <label key={champ} className="block">
                      <span className="text-xs font-medium text-slate-500">{label}</span>
                      <span className="mt-1 flex items-stretch rounded-xl bg-carte ring-1 ring-ios-sep/60 focus-within:ring-2 focus-within:ring-ios-blue">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          value={v[champ]}
                          onChange={(e) => modifier(v.id, champ, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-full min-w-0 bg-transparent px-3 py-2 text-base font-medium outline-none"
                        />
                        <span className="flex items-center rounded-r-xl px-2 text-xs text-ios-gray">{unite}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 ${sv.classes}`}>
                  <span className="text-sm font-semibold">{sv.label}</span>
                  {ev?.centimesParMile !== null && ev?.centimesParMile !== undefined && (
                    <span className="text-sm">
                      <span className="text-xl font-extrabold">{fmtCentimes(ev.centimesParMile)}</span> par mile ·{' '}
                      {fmtEuros(ev.economie)} économisés pour {fmtEntier(ev.miles)} miles
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={ajouter}
            className="inline-flex items-center justify-center rounded-2xl bg-ios-blue px-5 py-3 text-[15px] font-semibold text-white transition active:opacity-80"
          >
            + Ajouter un vol
          </button>
          <button
            type="button"
            onClick={onPartager}
            className="inline-flex items-center justify-center rounded-2xl bg-ios-fill px-5 py-3 text-[15px] font-semibold text-ios-blue transition active:opacity-80"
          >
            {etatPartage === 'copie' ? 'Lien copié !' : etatPartage === 'echec' ? 'Impossible de copier' : '↗ Partager la comparaison'}
          </button>
        </div>
      </Section>

      <Section titre="Classement">
        {meilleur ? (
          <>
            <div className="degrade-vert ombre-carte rounded-2xl px-5 py-4 text-white">
              <p className="text-sm text-blue-100">Le plus rentable en miles</p>
              <p className="text-xl font-extrabold">{meilleur.libelle || 'Vol sans nom'}</p>
              <p className="text-sm text-blue-100">
                {fmtCentimes(meilleur.centimesParMile ?? 0)} par mile, {fmtEuros(meilleur.economie)} économisés
              </p>
            </div>
            <ol className="mt-4 divide-y divide-ios-sep/60 rounded-2xl bg-carte">
              {classes
                .filter((v) => v.centimesParMile !== null)
                .map((v, i) => (
                  <li key={v.id} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ios-fill text-sm font-bold text-ios-blue">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{v.libelle || 'Vol sans nom'}</p>
                      <p className="text-xs text-slate-500">
                        {fmtEntier(v.miles)} miles + {fmtEuros(v.taxes)} contre {fmtEuros(v.prixCash)} en euros
                      </p>
                    </div>
                    <p className={`shrink-0 font-bold ${v.verdict === 'excellent' ? 'text-emerald-700' : v.verdict === 'mauvais' ? 'text-rose-700' : 'text-navy'}`}>
                      {fmtCentimes(v.centimesParMile ?? 0)}
                    </p>
                  </li>
                ))}
            </ol>
          </>
        ) : (
          <p className="rounded-2xl bg-carte px-5 py-4 text-sm text-slate-600">Ajoutez au moins un vol avec son prix en euros et en miles.</p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-2xl bg-rose-50 p-4 text-rose-800">
            <p className="font-bold">Moins de {cfg.seuils.mauvais.toLocaleString('fr-FR')} ct par mile</p>
            <p className="mt-1">Payez en euros et gardez vos miles pour mieux.</p>
          </div>
          <div className="rounded-2xl bg-sky-soft p-4 text-ios-blue">
            <p className="font-bold">Entre {cfg.seuils.mauvais.toLocaleString('fr-FR')} et {cfg.seuils.excellent.toLocaleString('fr-FR')} ct</p>
            <p className="mt-1">Valeur normale d’un mile : payer en miles est raisonnable.</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">
            <p className="font-bold">Plus de {cfg.seuils.excellent.toLocaleString('fr-FR')} ct par mile</p>
            <p className="mt-1">Foncez : c’est typiquement la Business ou une promo.</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Repère : rembourser un achat avec Pay with Miles rapporte {cfg.plancherPayWithMiles.toLocaleString('fr-FR')} ct par mile
          (1 000 miles = 4 €). Tout vol au-dessus de ce plancher vaut mieux qu’un remboursement.
        </p>
      </Section>
    </>
  )
}
