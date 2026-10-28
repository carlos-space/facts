import type { FactsModule } from 'fact-kit'
import { wranglerFacts } from './wrangler.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...wranglerFacts],
}

export default entry
