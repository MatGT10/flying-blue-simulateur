import { Link } from 'react-router-dom'
import type { Config } from '../lib/config'
import { fmtDate } from '../lib/format'
import { pages } from './Nav'

export default function Footer({ config }: { config: Config }) {
  return (
    <footer className="bg-navy-deep py-8 text-sm text-blue-200">
      <div className="mx-auto w-full max-w-3xl px-4 flex flex-col gap-4">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {pages.map((p) => (
            <li key={p.to}>
              <Link to={p.to} className="hover:text-white">
                {p.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/faq#transparence" className="hover:text-white">
              Transparence
            </Link>
          </li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </footer>
  )
}
