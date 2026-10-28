import type { FactsModule } from 'fact-kit'
import { notarizationFacts } from './notarization.ts'
import { gatekeeperFacts } from './gatekeeper.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...notarizationFacts, ...gatekeeperFacts],
}

export default entry
