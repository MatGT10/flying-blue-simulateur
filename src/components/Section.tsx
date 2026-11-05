import type { ReactNode } from 'react'

interface Props {
  id?: string
  titre: string
  sousTitre?: string
  children: ReactNode
  fond?: 'clair' | 'blanc' | 'navy'
}

export default function Section({ id, titre, sousTitre, children, fond = 'clair' }: Props) {
  const fonds = {
    clair: 'bg-slate-50',
    blanc: 'bg-white',
    navy: 'bg-navy text-white',
  }
  const sous = fond === 'navy' ? 'text-blue-100' : 'text-slate-600'
  return (
    <section id={id} className={`${fonds[fond]} py-12 sm:py-16`}>
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{titre}</h2>
        {sousTitre && <p className={`mt-2 ${sous}`}>{sousTitre}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}
