import type { FactsModule } from 'fact-kit'
import { authFacts } from './auth.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...authFacts],
}

export default entry
