import type { Config } from '../lib/config'
import Offre from '../components/Offre'
import Parrainage from '../components/Parrainage'

export default function PageOffre({ config }: { config: Config }) {
  return (
    <>
      <Offre config={config} />
      <Parrainage config={config} />
    </>
  )
}
