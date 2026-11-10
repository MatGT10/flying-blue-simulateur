import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import BoutonActualiser from './BoutonActualiser'
import Icone from './Icone'

export const pages = [
  { to: '/', label: 'Accueil', titre: 'Les miles Flying Blue expliqués simplement · Simulateur et guide', icone: 'maison' },
  { to: '/simulateur', label: 'Simulateur', titre: 'Simulateur de miles Flying Blue · Silver, Gold ou Platinum ?', icone: 'calculatrice' },
  { to: '/valeur', label: 'Payer en miles ?', titre: 'Quel vol payer en miles ? Valeur d’un mile · Simulateur Flying Blue', icone: 'avion' },
  { to: '/offre', label: 'Offre', titre: 'Offre du moment et parrainage · Simulateur Flying Blue', icone: 'cadeau' },
  { to: '/partenaires', label: 'Partenaires', titre: 'Gagner des miles sans prendre l’avion · Partenaires Flying Blue', icone: 'globe' },
  { to: '/comparatif', label: 'Comparatif', titre: 'Rentabilité et avantages des cartes · Simulateur Flying Blue', icone: 'tendance' },
  { to: '/inscription', label: 'Inscription', titre: 'Comment s’inscrire, étape par étape · Simulateur Flying Blue', icone: 'crayon' },
  { to: '/faq', label: 'FAQ', titre: 'Questions fréquentes et lexique · Simulateur Flying Blue', icone: 'question' },
]

/** Les 4 premières pages ont leur onglet ; les autres passent par « Plus ». */
const ONGLETS = pages.slice(0, 4)
const AUTRES = pages.slice(4)

function IconeOnglet({ nom }: { nom: string }) {
  if (nom === 'maison') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" />
      </svg>
    )
  }
  if (nom === 'plus') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
        <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
      </svg>
    )
  }
  return <Icone nom={nom} className="h-6 w-6" />
}

/** Feuille « Plus » : bulle de verre qui monte, se ferme en la tirant vers le bas (ou en touchant le fond). */
function FeuillePlus({ ouverte, onFermer }: { ouverte: boolean; onFermer: () => void }) {
  const [montee, setMontee] = useState(false) // vrai dès que la feuille doit être affichée (animation d'entrée)
  const [sortie, setSortie] = useState(false) // animation de sortie en cours
  const [glisse, setGlisse] = useState(0) // décalage vertical pendant le tirage
  const departY = useRef<number | null>(null)
  const glisseRef = useRef(0) // valeur courante du tirage, lue à la fin du geste sans attendre un rendu

  useEffect(() => {
    if (ouverte) {
      setSortie(false)
      setGlisse(0)
      setMontee(true)
    } else if (montee) {
      setSortie(true)
      const id = window.setTimeout(() => {
        setMontee(false)
        setSortie(false)
      }, 260)
      return () => window.clearTimeout(id)
    }
  }, [ouverte, montee])

  if (!montee) return null

  const onStart = (e: React.TouchEvent) => {
    departY.current = e.touches[0].clientY
  }
  const onMove = (e: React.TouchEvent) => {
    if (departY.current === null) return
    const dy = e.touches[0].clientY - departY.current
    if (dy > 0) {
      glisseRef.current = dy
      setGlisse(dy)
    }
  }
  const onEnd = () => {
    const d = glisseRef.current
    glisseRef.current = 0
    departY.current = null
    if (d > 80) onFermer()
    else setGlisse(0)
  }

  return (
    <div className="fixed inset-0 z-30 sm:hidden" role="dialog" aria-modal="true" aria-label="Plus de pages">
      <button
        type="button"
        className={`absolute inset-0 bg-black/25 transition-opacity duration-300 ${sortie ? 'opacity-0' : 'opacity-100'}`}
        aria-label="Fermer"
        onClick={onFermer}
      />
      <div
        className={`glass absolute inset-x-3 bottom-3 rounded-[28px] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] ${sortie ? 'feuille-sortie' : 'feuille-entree'}`}
        style={{ transform: glisse ? `translateY(${glisse}px)` : undefined, transition: glisse ? 'none' : undefined }}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        data-sans-geste
      >
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-ios-label/20" aria-hidden="true" />
        <ul>
          {AUTRES.map((p, i) => (
            <li key={p.to} className={i > 0 ? 'border-t border-ios-label/10' : ''}>
              <NavLink
                to={p.to}
                onClick={onFermer}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3.5 text-[17px] ${isActive ? 'text-ios-blue' : 'text-ios-label'}`
                }
              >
                <span className="flex-1">{p.label}</span>
                <span className="text-ios-gray" aria-hidden="true">›</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Nav() {
  const [plus, setPlus] = useState(false)
  const { pathname } = useLocation()
  const courante = pages.find((p) => p.to === pathname) ?? pages[0]
  const dansPlus = AUTRES.some((p) => p.to === pathname)

  return (
    <>
      {/* Barre du haut : translucide, titre centré sur mobile, onglets sur ordinateur */}
      <header className="sticky top-0 z-20 border-b border-ios-sep/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 sm:hidden" style={{ minHeight: 44 }}>
          <NavLink to="/" className="inline-flex items-center text-ios-blue text-[15px]" onClick={() => setPlus(false)}>
            <Icone nom="avion" className="mr-1 h-4 w-4" />
            Flying Blue
          </NavLink>
          <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-ios-label">{courante.label}</span>
          <span className="flex w-20 justify-end"><BoutonActualiser /></span>
        </div>
        <div className="mx-auto hidden w-full max-w-4xl flex-wrap items-center gap-x-0.5 gap-y-0 px-4 sm:flex">
          <NavLink to="/" className="inline-flex shrink-0 items-center py-2.5 pr-2 text-[15px] font-semibold text-ios-label">
            <Icone nom="avion" className="mr-1 h-4 w-4 text-ios-blue" />
            Flying Blue
          </NavLink>
          <BoutonActualiser />
          {pages.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              end={p.to === '/'}
              className={({ isActive }) =>
                `shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[14px] transition ${isActive ? 'bg-ios-blue text-white' : 'text-ios-blue hover:bg-ios-fill'}`
              }
            >
              {p.label}
            </NavLink>
          ))}
        </div>
      </header>

      <FeuillePlus ouverte={plus} onFermer={() => setPlus(false)} />

      {/* Barre d'onglets (mobile) : pilule flottante en verre */}
      <nav
        className="barre-onglets fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 sm:hidden pointer-events-none"
        data-sans-geste
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        aria-label="Navigation principale"
      >
        <ul className="glass pointer-events-auto grid w-full max-w-md grid-cols-5 rounded-full px-1.5 py-1.5">
          {ONGLETS.map((p) => (
            <li key={p.to}>
              <NavLink
                to={p.to}
                end={p.to === '/'}
                onClick={() => setPlus(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition ${
                    isActive && !plus ? 'glass-active text-ios-blue' : 'text-ios-label/70'
                  }`
                }
              >
                <IconeOnglet nom={p.icone} />
                <span className="truncate max-w-full px-1">{p.label === 'Payer en miles ?' ? 'Vols' : p.label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setPlus((o) => !o)}
              aria-expanded={plus}
              className={`flex w-full flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition ${plus || dansPlus ? 'glass-active text-ios-blue' : 'text-ios-label/70'}`}
            >
              <IconeOnglet nom="plus" />
              <span>Plus</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
