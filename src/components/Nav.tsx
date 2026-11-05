import { NavLink } from 'react-router-dom'

export const pages = [
  { to: '/', label: 'Simulateur', titre: 'Simulateur de miles Flying Blue · Silver, Gold ou Platinum ?' },
  { to: '/offre', label: 'Offre', titre: 'Offre du moment et parrainage · Simulateur Flying Blue' },
  { to: '/comparatif', label: 'Comparatif', titre: 'Rentabilité et avantages des cartes · Simulateur Flying Blue' },
  { to: '/faq', label: 'FAQ', titre: 'Questions fréquentes · Simulateur Flying Blue' },
]

export default function Nav() {
  return (
    <nav className="sticky top-0 z-20 bg-navy-deep/95 text-white backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-4">
        <NavLink to="/" className="hidden sm:block shrink-0 py-3 pr-3 text-sm font-bold" aria-label="Accueil">
          ✈︎ Flying Blue
        </NavLink>
        <ul className="-mx-4 flex flex-1 gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none]">
          {pages.map((p) => (
            <li key={p.to} className="shrink-0">
              <NavLink
                to={p.to}
                end={p.to === '/'}
                className={({ isActive }) =>
                  `block border-b-2 px-3 py-3 text-sm font-medium transition ${
                    isActive ? 'border-gold text-white' : 'border-transparent text-blue-200 hover:text-white'
                  }`
                }
              >
                {p.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
