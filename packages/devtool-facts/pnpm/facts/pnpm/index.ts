import type { Fact, FactsModule } from 'fact-kit'
import converted from './converted.json' with { type: 'json' }
import { pnpmFacts } from './pnpm.ts'

// `converted.json` is written by scripts/convert-pnpm.ts from pinned upstream files.
const entry: FactsModule = {
  describes: {},
  facts: [...pnpmFacts, ...(converted.facts as Fact[])],
}

export default entry
