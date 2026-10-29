import type { FactsModule } from 'fact-kit'
import { workspaceFacts } from './workspace.ts'
import { buildFacts } from './build.ts'
import { formatFacts } from './format.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...workspaceFacts, ...buildFacts, ...formatFacts],
}

export default entry
