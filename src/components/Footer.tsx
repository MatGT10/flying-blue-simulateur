import type { Config } from '../lib/config'
import { fmtDate } from '../lib/format'

export default function Footer({ config }: { config: Config }) {
  return (
    <footer className="bg-navy-deep py-8 text-sm text-blue-200">
      <div className="mx-auto w-full max-w-3xl px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {config.site.titre} · données au {fmtDate(config.dateMiseAJour)}
        </p>
        <p>
          Par{' '}
          {config.site.lienAuteur ? (
            <a href={config.site.lienAuteur} target="_blank" rel="noopener" className="font-medium text-white underline-offset-2 hover:underline">
              {config.site.nomAuteur}
            </a>
          ) : (
            <span className="font-medium text-white">{config.site.nomAuteur}</span>
          )}
        </p>
      </div>
    </footer>
  )
}
