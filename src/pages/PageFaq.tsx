import type { Config } from '../lib/config'
import FAQ from '../components/FAQ'
import Transparence from '../components/Transparence'

export default function PageFaq({ config }: { config: Config }) {
  return (
    <>
      <FAQ config={config} />
      <Transparence config={config} />
    </>
  )
}
