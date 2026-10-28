import type { FactsModule } from 'fact-kit'
import { versionFacts } from './version.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...versionFacts],
}

export default entry
