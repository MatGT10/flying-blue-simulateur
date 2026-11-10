import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pages } from '../lib/pages'
import { memoriserDefilement } from '../lib/defilement'

/**
 * Au changement de page : titre du document et défilement vers l'ancre s'il y en a une.
 * Mémorise en continu la position de défilement de la page affichée (le retour à cette
 * position est fait par la scène, dans App.tsx, avant le premier affichage).
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const page = pages.find((p) => p.to === pathname)
    if (page) document.title = page.titre
    if (!hash) return
    // Un tick plus tard : la page vient d'être rendue et le navigateur a fini son propre traitement du hash.
    const id = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
    return () => window.clearTimeout(id)
  }, [pathname, hash])

  useEffect(() => {
    const noter = () => memoriserDefilement(pathname, window.scrollY)
    noter() // la page affichée devient la « dernière page », même sans défiler
    window.addEventListener('scroll', noter, { passive: true })
    return () => window.removeEventListener('scroll', noter)
  }, [pathname])

  return null
}
