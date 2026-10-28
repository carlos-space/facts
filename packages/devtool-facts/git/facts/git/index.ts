import type { FactsModule } from 'fact-kit'
import { commitFacts } from './commit.ts'
import { mergeFacts } from './merge.ts'

const entry: FactsModule = {
  describes: {},
  facts: [...commitFacts, ...mergeFacts],
}

export default entry
