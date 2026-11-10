import { useEffect, useState } from 'react'
import { estEnModeAppli, estIphone } from '../lib/appli'

type EvenementInstall = Event & { prompt: () => Promise<void> }

export default function Installer() {
  const [enAppli] = useState(() => estEnModeAppli())
  const [iphone] = useState(() => estIphone())
  const [invite, setInvite] = useState<EvenementInstall | null>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInvite(e as EvenementInstall)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (enAppli) return null

  return (
    <div className="ombre-carte rounded-2xl bg-carte p-5">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-ios-gray">Application</p>
      <h3 className="mt-1 text-[20px] font-bold text-ios-label">Installez le simulateur sur votre téléphone</h3>
      <p className="mt-2 text-[15px] text-slate-600">
        Plein écran, icône sur l’écran d’accueil, et un tirage vers le bas pour la mettre à jour.
      </p>
      <div className="mt-4 hidden sm:flex items-center gap-5 rounded-2xl bg-ios-bg p-4">
        <img src="/qr-app.svg" alt="QR code vers la page d’installation" width={120} height={120} className="rounded-lg bg-white p-1" />
        <p className="text-[15px] text-slate-600">
          Sur ordinateur ? Scannez ce code avec l’appareil photo de votre téléphone : il ouvre la page d’installation.
        </p>
      </div>
      {invite ? (
        <button
          type="button"
          onClick={() => invite.prompt()}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-ios-blue px-5 py-3 text-[15px] font-semibold text-white active:opacity-80"
        >
          Installer l’application
        </button>
      ) : (
        <ol className="mt-4 space-y-2 text-[15px] text-slate-700">
          {(iphone
            ? ['Ouvrez ce site dans Safari.', 'Touchez le bouton Partager (le carré avec la flèche).', 'Choisissez « Sur l’écran d’accueil », puis « Ajouter ».']
            : ['Ouvrez ce site dans votre navigateur habituel (Chrome, Samsung Internet, Firefox…).', 'Ouvrez le menu du navigateur.', 'Choisissez « Ajouter à l’écran d’accueil » ou « Installer l’application ».']
          ).map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ios-fill text-[12px] font-bold text-ios-blue">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
