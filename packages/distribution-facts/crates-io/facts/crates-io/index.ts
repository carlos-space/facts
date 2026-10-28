import type { FactsModule } from 'fact-kit'
import { authenticationFacts } from './authentication.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...authenticationFacts],
}

export default entry
