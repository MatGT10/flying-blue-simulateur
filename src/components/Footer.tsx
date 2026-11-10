import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import { fmtDate } from '../lib/format'
import { pages } from '../lib/pages'

export default function Footer({ config }: { config: Config }) {
  return (
    <footer className="pied border-t border-ios-sep/60 bg-carte py-8 text-[13px] text-ios-gray">
      <div className="mx-auto w-full max-w-3xl px-4 flex flex-col gap-4">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {pages.map((p) => (
            <li key={p.to}>
              <Link to={p.to} className="font-medium text-ios-blue">
                {p.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/faq#transparence" className="text-ios-blue">
              Transparence
            </Link>
          </li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-semibold text-ios-label">{config.site.titre}</span> · données au {fmtDate(config.dateMiseAJour)}
            <br />
            <span className="text-ios-gray/80">
              Version {__VERSION__} · build {__BUILD__} du {fmtDate(__BUILD_DATE__)}
            </span>
          </p>
          <p>
            Par{' '}
            {config.site.lienAuteur ? (
              <a href={config.site.lienAuteur} target="_blank" rel="noopener" className="font-medium text-ios-blue">
                {config.site.nomAuteur}
              </a>
            ) : (
              <span className="font-medium text-ios-label">{config.site.nomAuteur}</span>
            )}
          </p>
        </div>
      </div>
    </footer>
  )
}
