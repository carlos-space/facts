import type { FactsModule } from 'fact-kit'
import { typescriptFacts } from './typescript.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...typescriptFacts],
}

export default entry
