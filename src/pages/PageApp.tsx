import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { estEnModeAppli, estIphone } from '../lib/appli'

type EvenementInstall = Event & { prompt: () => Promise<void> }

/** Pictogrammes des boutons système cités dans les étapes (repères, pas décoration). */
function GlyphePartager() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline h-5 w-5 align-[-4px] text-ios-blue" aria-label="bouton Partager">
      <path d="M12 3v12M8 7l4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  )
}
function GlypheAjouter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline h-5 w-5 align-[-4px] text-ios-label" aria-label="icône Sur l’écran d’accueil">
      <rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" />
    </svg>
  )
}
function GlypheMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline h-5 w-5 align-[-4px] text-ios-label" aria-label="menu">
      <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
    </svg>
  )
}

export default function PageApp() {
  const [enAppli] = useState(() => estEnModeAppli())
  const [iphone, setIphone] = useState(() => estIphone())
  const [invite, setInvite] = useState<EvenementInstall | null>(null)

  useEffect(() => {
    document.title = 'Installer l’application · Simulateur Flying Blue'
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInvite(e as EvenementInstall)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (enAppli) {
    return (
      <section className="py-10">
        <div className="mx-auto w-full max-w-md px-4 text-center">
          <div className="degrade-vert ombre-carte mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true"><path d="M5 12l4 4L19 6" /></svg>
          </div>
          <h1 className="mt-5 text-[28px] font-bold tracking-tight text-ios-label">L’application est installée</h1>
          <p className="mt-2 text-[15px] text-slate-600">Vous êtes déjà dans la version plein écran. Bon vol.</p>
          <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-ios-blue px-6 py-3.5 text-[17px] font-semibold text-white active:opacity-80">
            Ouvrir le simulateur
          </Link>
        </div>
      </section>
    )
  }

  const etapesIphone = [
    <>Ouvrez cette page dans <strong>Safari</strong>. Si vous êtes dans Instagram ou un autre navigateur, touchez les trois points et choisissez « Ouvrir dans Safari ».</>,
    <>Touchez le bouton <strong>Partager</strong> <GlyphePartager /> au milieu de la barre du bas.</>,
    <>Faites défiler la liste et choisissez <strong>Sur l’écran d’accueil</strong> <GlypheAjouter />, puis <strong>Ajouter</strong> en haut à droite.</>,
  ]
  const etapesAndroid = [
    <>Ouvrez cette page dans <strong>Chrome</strong>.</>,
    <>Touchez le menu <GlypheMenu /> en haut à droite.</>,
    <>Choisissez <strong>Ajouter à l’écran d’accueil</strong> ou <strong>Installer l’application</strong>, puis confirmez.</>,
  ]

  return (
    <>
      <header className="hero-degrade text-white">
        <div className="mx-auto w-full max-w-md px-4 pt-10 pb-8 text-center">
          <img src="/icon-192.png" alt="" width={72} height={72} className="mx-auto rounded-[18px] shadow-lg shadow-black/20" />
          <h1 className="mt-4 text-[30px] leading-tight font-bold tracking-tight">Ajoutez le simulateur à votre écran d’accueil</h1>
          <p className="mt-3 text-[15px] text-white/85">
            Gratuit, sans inscription, sans passer par un magasin d’applications. Trois gestes, trente secondes.
          </p>
          {invite && (
            <button
              type="button"
              onClick={() => invite.prompt()}
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-[17px] font-semibold text-ios-blue shadow-lg shadow-black/10 active:opacity-80"
            >
              Installer l’application
            </button>
          )}
        </div>
      </header>

      <section className="py-8">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-ios-fill p-0.5" role="radiogroup" aria-label="Type de téléphone">
            {[
              { v: true, l: 'iPhone' },
              { v: false, l: 'Android' },
            ].map((o) => (
              <button
                key={o.l}
                type="button"
                role="radio"
                aria-checked={iphone === o.v}
                onClick={() => setIphone(o.v)}
                className={`rounded-lg px-3 py-2 text-[15px] font-semibold transition ${iphone === o.v ? 'bg-segment shadow-sm text-ios-label' : 'text-slate-600'}`}
              >
                {o.l}
              </button>
            ))}
          </div>
          <ol className="ombre-carte divide-y divide-ios-sep/60 rounded-2xl bg-carte">
            {(iphone ? etapesIphone : etapesAndroid).map((e, i) => (
              <li key={i} className="flex gap-4 px-4 py-4">
                <span className="degrade-bleu flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white">{i + 1}</span>
                <p className="text-[16px] leading-relaxed text-slate-700">{e}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[13px] text-ios-gray">
            Une fois installée, l’application s’ouvre en plein écran, et un tirage vers le bas la met à jour.
          </p>
          <Link to="/" className="mt-6 block text-center text-[15px] font-semibold text-ios-blue">
            Continuer sur le site sans installer ›
          </Link>
        </div>
      </section>
    </>
  )
}
