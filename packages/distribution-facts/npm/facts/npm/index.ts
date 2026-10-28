import type { FactsModule } from 'fact-kit'
import { authenticationFacts } from './authentication.ts'
import { releaseFacts } from './release.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...authenticationFacts, ...releaseFacts],
}

export default entry
