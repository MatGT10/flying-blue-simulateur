import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

export const pages = [
  { to: '/', label: 'Accueil', titre: 'Les miles Flying Blue expliqués simplement · Simulateur et guide' },
  { to: '/simulateur', label: 'Simulateur', titre: 'Simulateur de miles Flying Blue · Silver, Gold ou Platinum ?' },
  { to: '/valeur', label: 'Payer en miles ?', titre: 'Quel vol payer en miles ? Valeur d’un mile · Simulateur Flying Blue' },
  { to: '/offre', label: 'Offre', titre: 'Offre du moment et parrainage · Simulateur Flying Blue' },
  { to: '/comparatif', label: 'Comparatif', titre: 'Rentabilité et avantages des cartes · Simulateur Flying Blue' },
  { to: '/inscription', label: 'Inscription', titre: 'Comment s’inscrire, étape par étape · Simulateur Flying Blue' },
  { to: '/faq', label: 'FAQ', titre: 'Questions fréquentes et lexique · Simulateur Flying Blue' },
]

export default function Nav() {
  const [ouvert, setOuvert] = useState(false)
  const { pathname } = useLocation()
  const courante = pages.find((p) => p.to === pathname) ?? pages[0]

  const lien = (p: (typeof pages)[number], mobile: boolean) => (
    <NavLink
      key={p.to}
      to={p.to}
      end={p.to === '/'}
      onClick={() => setOuvert(false)}
      className={({ isActive }) =>
        mobile
          ? `block rounded-lg px-4 py-3 text-base font-medium ${isActive ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5'}`
          : `block border-b-2 px-3 py-3 text-sm font-medium transition ${isActive ? 'border-gold text-white' : 'border-transparent text-blue-200 hover:text-white'}`
      }
    >
      {p.label}
    </NavLink>
  )

  return (
    <nav className="sticky top-0 z-20 bg-navy-deep/95 text-white backdrop-blur">
      <div className="mx-auto w-full max-w-3xl px-4">
        {/* Mobile : titre de la page courante + bouton menu */}
        <div className="flex items-center justify-between py-2 sm:hidden">
          <NavLink to="/" className="text-sm font-bold" onClick={() => setOuvert(false)}>
            ✈︎ Flying Blue
          </NavLink>
          <button
            type="button"
            onClick={() => setOuvert((o) => !o)}
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-medium"
          >
            <span>{courante.label}</span>
            <span aria-hidden="true">{ouvert ? '✕' : '☰'}</span>
            <span className="sr-only">Menu</span>
          </button>
        </div>
        {ouvert && (
          <div id="menu-mobile" className="flex flex-col gap-1 pb-3 sm:hidden">
            {pages.map((p) => lien(p, true))}
          </div>
        )}
        {/* Ordinateur : onglets */}
        <div className="hidden sm:flex items-center gap-2">
          <NavLink to="/" className="shrink-0 py-3 pr-3 text-sm font-bold">
            ✈︎ Flying Blue
          </NavLink>
          <div className="flex gap-1">{pages.map((p) => lien(p, false))}</div>
        </div>
      </div>
    </nav>
  )
}
