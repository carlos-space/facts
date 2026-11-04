import type { FactsModule } from 'fact-kit'
import { stopFacts } from './stop.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...stopFacts],
}

export default entry
