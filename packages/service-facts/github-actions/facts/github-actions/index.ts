import type { Fact, FactsModule } from 'fact-kit'
import converted from './converted.json' with { type: 'json' }
import { actionsFacts } from './actions.ts'

// `converted.json` is written by scripts/convert-github-actions.ts from pinned upstream files.
const entry: FactsModule = {
  describes: {},
  facts: [...actionsFacts, ...(converted.facts as Fact[])],
}

export default entry
