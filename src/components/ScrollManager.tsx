import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pages } from '../lib/pages'

/** Au changement de page : titre du document, défilement en haut ou vers l'ancre. */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const page = pages.find((p) => p.to === pathname)
    if (page) document.title = page.titre
    // Un tick plus tard : la page vient d'être rendue et le navigateur a fini son propre traitement du hash.
    const id = window.setTimeout(() => {
      if (hash) {
        const el = document.getElementById(hash.slice(1))
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
      // Retour en haut immédiat : un défilement animé se superposerait à l'animation d'entrée de la page.
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 0)
    return () => window.clearTimeout(id)
  }, [pathname, hash])
  return null
}
