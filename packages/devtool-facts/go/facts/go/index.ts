import type { FactsModule } from 'fact-kit'
import { workspaceFacts } from './workspace.ts'
import { buildFacts } from './build.ts'
import { depsFacts } from './deps.ts'
import { formatFacts } from './format.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...workspaceFacts, ...buildFacts, ...depsFacts, ...formatFacts],
}

export default entry
