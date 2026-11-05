import type { Config } from '../lib/config'
import Rentabilite from '../components/Rentabilite'
import Avantages from '../components/Avantages'

export default function PageComparatif({ config }: { config: Config }) {
  return (
    <>
      <Rentabilite config={config} />
      <Avantages config={config} />
    </>
  )
}
