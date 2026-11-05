import type { Config } from '../lib/config'
import FAQ from '../components/FAQ'
import Lexique from '../components/Lexique'
import Transparence from '../components/Transparence'

export default function PageFaq({ config }: { config: Config }) {
  return (
    <>
      <FAQ config={config} />
      <Lexique config={config} />
      <Transparence config={config} />
    </>
  )
}
