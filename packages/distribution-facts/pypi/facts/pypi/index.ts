import type { FactsModule } from 'fact-kit'
import { authenticationFacts } from './authentication.ts'
import { versionFacts } from './version.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...authenticationFacts, ...versionFacts],
}

export default entry
