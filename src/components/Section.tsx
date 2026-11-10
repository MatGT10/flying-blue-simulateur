import type { ReactNode } from 'react'

interface Props {
  id?: string
  titre: string
  sousTitre?: string
  children: ReactNode
}

export default function Section({ id, titre, sousTitre, children }: Props) {
  return (
    <section id={id} className="py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-[28px] sm:text-[32px] font-bold tracking-tight text-ios-label">{titre}</h2>
        {sousTitre && <p className="mt-2 text-[15px] text-slate-600">{sousTitre}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </section>
  )
}
