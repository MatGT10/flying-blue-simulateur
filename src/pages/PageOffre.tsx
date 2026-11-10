import type { Config } from '../lib/config'
import Offre from '../components/Offre'
import Parrainage from '../components/Parrainage'
import BonsPlans from '../components/BonsPlans'

export default function PageOffre({ config }: { config: Config }) {
  return (
    <>
      <Offre config={config} />
      <BonsPlans config={config} />
      <Parrainage config={config} />
    </>
  )
}
