import type { Config } from '../lib/config'

/** Lien vers la page officielle des billets primes : le vrai prix du jour, en un tap. */
export default function BoutonVerifier({ config, className = '' }: { config: Config; className?: string }) {
  return (
    <a
      href={config.liensFlyingBlue.billetsPrimes}
      target="_blank"
      rel="noopener"
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-ios-fill px-4 py-2 text-[15px] font-semibold text-ios-blue active:opacity-80 ${className}`}
    >
      Vérifier les prix du jour sur Flying Blue ↗
    </a>
  )
}
